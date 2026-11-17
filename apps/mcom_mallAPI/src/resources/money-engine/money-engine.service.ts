import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager, ILike, LessThanOrEqual } from 'typeorm';
import {
  BurnStrategy,
  FunctionalType,
  RewardDefinition,
  ScopeType,
} from './entities/reward-definition.entity';
import { UserVoucher, VoucherState } from './entities/user-voucher.entity';
import {
  TransactionSourceType,
  VoucherTransaction,
} from './entities/voucher-transaction.entity';
import {
  CashbackInjectionDto,
  ContributeToVoucherDto,
  CreateRewardDefinitionDto,
  InitiateContributionDto,
  IssueVoucherDto,
  PurchaseVoucherDto,
  SpendDto,
  UpdateRewardDefinitionDto,
} from './dto/dtos';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { customAlphabet } from 'nanoid';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { PaymentGateway } from '../payments/enums/payment-gateway.enum';
import { PaymentHistory } from '../payments/entities/payment-history.entity';
import { PaymentPurpose } from '../payments/enums/payment-purpose.enum';
import {
  INSTRUMENT_EVENTS,
  InstrumentEventPayload,
  InstrumentEventType,
} from '../../common/instrument-events';
import { FeatureFlagsService } from '../../common/feature-flags/feature-flags.service';
import { DigitalValueService } from '../digital-value/digital-value.service';
import { DigitalValueType } from '../digital-value/digital-value.enums';
import { ScopeMode } from '../partner-instruments/enums';
import type { NormalisedScope } from '../partner-instruments/instrument-scope.service';
import { UserRole } from '../../common/role.enum';

const generateVoucherCode = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  12,
);

export interface RedemptionResult {
  voucher: UserVoucher;
  realDeduction: number;
  rewardDeduction: number;
}

@Injectable()
export class MoneyEngineService {
  private readonly logger = new Logger(MoneyEngineService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly paymentProviderService: PaymentProviderService,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
    @Optional()
    private readonly featureFlags?: FeatureFlagsService,
    @Optional()
    private readonly digitalValueService?: DigitalValueService,
  ) {}

  /**
   * Telemetry must never break a money operation, so failures are swallowed.
   * The payload is intentionally ledger-agnostic: callers supply the canonical
   * `kind` so downstream consumers do not need to know which table was used.
   */
  private emitInstrumentEvent(
    type: InstrumentEventType,
    payload: InstrumentEventPayload,
  ): void {
    try {
      this.eventEmitter?.emit(type, {
        ...payload,
        occurredAt: new Date().toISOString(),
      });
    } catch {
      // Intentionally ignored: emitting is best-effort.
    }
  }

  /**
   * Validate definition invariants that class-validator cannot express:
   * the split must sum to 1, and money/percentage fields must be sane.
   */
  private assertDefinitionConfig(input: {
    splitRatio?: { real: number; reward: number } | null;
    faceValue?: number | null;
    maxCashbackPercent?: number | null;
  }): void {
    if (input.splitRatio) {
      const real = Number(input.splitRatio.real);
      const reward = Number(input.splitRatio.reward);
      if (!Number.isFinite(real) || !Number.isFinite(reward)) {
        throw new BadRequestException(
          'Split ratio values must be valid numbers.',
        );
      }
      if (real < 0 || reward < 0) {
        throw new BadRequestException(
          'Split ratio values must be non-negative.',
        );
      }
      const sum = Number((real + reward).toFixed(4));
      if (Math.abs(sum - 1) > 0.0001) {
        throw new BadRequestException(
          'Split ratio real + reward must equal 1.',
        );
      }
    }

    if (input.faceValue !== undefined && input.faceValue !== null) {
      const faceValue = Number(input.faceValue);
      if (!Number.isFinite(faceValue) || faceValue <= 0) {
        throw new BadRequestException('faceValue must be a positive number.');
      }
    }

    if (
      input.maxCashbackPercent !== undefined &&
      input.maxCashbackPercent !== null
    ) {
      const percent = Number(input.maxCashbackPercent);
      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        throw new BadRequestException(
          'maxCashbackPercent must be between 0 and 100.',
        );
      }
    }
  }

  // --- Shared invariants ---

  private behaviourOf(voucher: UserVoucher): FunctionalType {
    return (voucher.functionalType ??
      voucher.definition?.functionalType ??
      FunctionalType.SPENDING_POWER) as FunctionalType;
  }

  private isPriceReducer(voucher: UserVoucher): boolean {
    return this.behaviourOf(voucher) === FunctionalType.PRICE_REDUCER;
  }

  private instrumentKind(voucher: UserVoucher): 'voucher_coupon' | 'coupon_voucher' {
    return this.isPriceReducer(voucher) ? 'voucher_coupon' : 'coupon_voucher';
  }

  private isExpired(voucher: UserVoucher): boolean {
    return Boolean(voucher.expiresAt && new Date() > new Date(voucher.expiresAt));
  }

  /**
   * Lazily expires wallets. Every read/write path calls this so a stale
   * `active` row can never be spent just because no cron job ran.
   */
  private async expireStaleVouchers(manager?: EntityManager): Promise<void> {
    const runner = manager ?? this.dataSource.manager;
    try {
      await runner
        .createQueryBuilder()
        .update(UserVoucher)
        .set({ state: VoucherState.EXPIRED })
        .where('state = :active', { active: VoucherState.ACTIVE })
        .andWhere('"expiresAt" IS NOT NULL AND "expiresAt" <= NOW()')
        .execute();
    } catch (error: any) {
      this.logger.warn(
        `Could not expire stale wallets: ${error?.message ?? error}`,
      );
    }
  }

  private async assertVoucherActive(voucher: UserVoucher): Promise<void> {
    if (voucher.state !== VoucherState.ACTIVE) {
      throw new BadRequestException('Voucher is not active.');
    }
    if (this.isExpired(voucher)) {
      voucher.state = VoucherState.EXPIRED;
      await this.dataSource.manager.save(voucher);
      throw new BadRequestException('Voucher has expired.');
    }
  }

  /**
   * A business caller may only act on a shop it owns. Admins are the only
   * cross-tenant callers.
   */
  private async assertBusinessOwnership(
    manager: EntityManager,
    businessId: string,
    actor: { id: string; role?: string },
  ): Promise<Business> {
    const business = await manager.findOne(Business, {
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException('Business not found.');
    }
    if (actor.role === UserRole.ADMIN) return business;
    if (business.user?.id !== actor.id) {
      throw new ForbiddenException(
        'You do not own the business this operation is attributed to.',
      );
    }
    return business;
  }

  private async ownedBusinessIds(
    manager: EntityManager,
    userId: string,
  ): Promise<string[]> {
    const shops = await manager.find(Business, {
      where: { user: { id: userId } },
      select: ['id'],
    });
    return shops.map((shop) => shop.id);
  }

  private assertRecipientInput(dto: IssueVoucherDto): void {
    if (!dto.recipientUserId && !dto.recipientEmail) {
      throw new BadRequestException(
        'Provide a recipientUserId or recipientEmail.',
      );
    }
  }

  // --- Digital-value mirror (Phase 4c) ---

  /**
   * Money-engine wallets remain the write source of truth, but every write is
   * mirrored into `digital_value_master` so there is one balance view. A
   * mirror failure is logged and never blocks the domain transaction.
   */
  private async mirrorCreateDigitalValue(
    voucher: UserVoucher,
    totalValue: number,
    userId: string,
    manager: EntityManager,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    if (!this.digitalValueService) return;
    try {
      const existing = await this.digitalValueService
        .getByCode(voucher.code)
        .catch(() => null);
      if (existing) return;

      await this.digitalValueService.create(
        {
          type: DigitalValueType.VOUCHER,
          code: voucher.code,
          initialValue: totalValue,
          ownerId: userId,
          metadata: {
            source: 'money_engine',
            userVoucherId: voucher.id,
            ...metadata,
          },
        },
        userId,
        manager,
      );
    } catch (error: any) {
      this.logger.warn(
        `Could not mirror wallet ${voucher.code} into digital value: ${error?.message ?? error}`,
      );
    }
  }

  private async mirrorFundDigitalValue(
    code: string,
    amount: number,
    manager: EntityManager,
  ): Promise<void> {
    if (!this.digitalValueService) return;
    try {
      const digitalValue = await this.digitalValueService.getByCode(code);
      await this.digitalValueService.fund(
        digitalValue.id,
        { amount },
        manager,
      );
    } catch (error: any) {
      if (error instanceof NotFoundException) return;
      this.logger.warn(
        `Could not mirror funding for wallet ${code}: ${error?.message ?? error}`,
      );
    }
  }

  private async mirrorRedeemDigitalValue(
    code: string,
    amount: number,
    manager: EntityManager,
  ): Promise<void> {
    if (!this.digitalValueService) return;
    try {
      const digitalValue = await this.digitalValueService.getByCode(code);
      await this.digitalValueService.redeem(
        digitalValue.id,
        { amount },
        manager,
      );
    } catch (error: any) {
      if (error instanceof NotFoundException) return;
      this.logger.warn(
        `Could not mirror redemption for wallet ${code}: ${error?.message ?? error}`,
      );
    }
  }

  // --- Admin: Create Definition ---
  async createRewardDefinition(
    dto: CreateRewardDefinitionDto,
  ): Promise<RewardDefinition> {
    this.assertDefinitionConfig(dto);
    const definition = new RewardDefinition();
    this.applyDefinitionDto(definition, dto);

    if (dto.validShopIds) {
      definition.validShops = dto.validShopIds.map(
        (id) => ({ id }) as Business,
      );
    }

    this.assertScopeUsable(definition);
    return await this.dataSource.manager.save(definition);
  }

  private assertScopeUsable(definition: RewardDefinition): void {
    if (definition.scopeType === ScopeType.ANY_SHOP) return;
    const hasShops = (definition.validShops ?? []).length > 0;
    const hasItems =
      (definition.validProductIds ?? []).length > 0 ||
      (definition.validServiceIds ?? []).length > 0;
    if (!hasShops && !hasItems) {
      throw new BadRequestException(
        'A restricted definition needs at least one valid shop (or product/service) before it can be saved.',
      );
    }
  }

  // --- Admin: Update Definition ---
  async updateRewardDefinition(
    id: string,
    dto: UpdateRewardDefinitionDto,
  ): Promise<RewardDefinition> {
    this.assertDefinitionConfig(dto);
    const definition = await this.dataSource.manager.findOne(RewardDefinition, {
      where: { id },
      relations: ['validShops'],
    });

    if (!definition) {
      throw new NotFoundException('Reward Definition not found');
    }

    this.applyDefinitionDto(definition, dto);

    if (dto.validShopIds) {
      definition.validShops = dto.validShopIds.map(
        (id) => ({ id }) as Business,
      );
    }

    this.assertScopeUsable(definition);
    return await this.dataSource.manager.save(definition);
  }

  private applyDefinitionDto(
    definition: RewardDefinition,
    dto: CreateRewardDefinitionDto | UpdateRewardDefinitionDto,
  ): void {
    const {
      validShopIds: _validShopIds,
      expiresAt,
      validProductIds,
      validServiceIds,
      ...rest
    } = dto as CreateRewardDefinitionDto;
    Object.assign(definition, rest);

    if (expiresAt !== undefined) {
      if (!expiresAt) {
        definition.expiresAt = null;
      } else {
        const parsed = new Date(expiresAt);
        if (Number.isNaN(parsed.getTime())) {
          throw new BadRequestException('expiresAt must be a valid date.');
        }
        definition.expiresAt = parsed;
      }
    }

    if (validProductIds !== undefined) {
      definition.validProductIds = validProductIds?.length
        ? validProductIds
        : null;
    }
    if (validServiceIds !== undefined) {
      definition.validServiceIds = validServiceIds?.length
        ? validServiceIds
        : null;
    }
  }

  // --- Issuance (Voucher Coupon + admin-funded campaign wallets) ---

  /**
   * Issue a wallet without a payment. This is how a Voucher Coupon
   * (`price_reducer`) reaches a customer, and how an admin grants a partially
   * funded spending-power wallet whose real share can then be topped up by
   * friends/family.
   *
   * Rules:
   * - `price_reducer` can be issued by an admin or by a business that owns at
   *   least one of the definition's listings.
   * - `spending_power` can only be issued by an admin (minting reward value for
   *   free is a platform decision, never a merchant one).
   */
  async issueVoucher(dto: IssueVoucherDto, actor: User): Promise<UserVoucher> {
    this.assertRecipientInput(dto);

    const definition = await this.dataSource.manager.findOne(RewardDefinition, {
      where: { id: dto.rewardDefinitionId },
      relations: ['validShops', 'validShops.user'],
    });
    if (!definition) {
      throw new NotFoundException('Reward Definition not found.');
    }
    if (!definition.isActive) {
      throw new BadRequestException('This reward definition is inactive.');
    }
    if (definition.faceValue === null || definition.faceValue === undefined) {
      throw new BadRequestException(
        'This definition needs a faceValue before it can issue wallets.',
      );
    }
    if (dto.expiresAt && new Date(dto.expiresAt).getTime() <= Date.now()) {
      throw new BadRequestException(
        'expiresAt must be in the future when issuing a wallet.',
      );
    }
    if (
      definition.expiresAt &&
      new Date(definition.expiresAt).getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'This reward definition has already expired.',
      );
    }

    const isPriceReducer =
      definition.functionalType === FunctionalType.PRICE_REDUCER;
    const isAdmin = actor.role === UserRole.ADMIN;

    let issuerBusinessId: string | null = null;
    if (!isAdmin) {
      if (!isPriceReducer) {
        throw new ForbiddenException(
          'Only an admin can issue a funded spending-power wallet.',
        );
      }
      const owned = await this.ownedBusinessIds(
        this.dataSource.manager,
        actor.id,
      );
      if (owned.length === 0) {
        throw new ForbiddenException(
          'Only a business owner can issue a Voucher Coupon.',
        );
      }
      if (definition.scopeType !== ScopeType.ANY_SHOP) {
        const allowed = (definition.validShops ?? [])
          .map((shop) => shop.id)
          .filter((id) => owned.includes(id));
        if (allowed.length === 0) {
          throw new ForbiddenException(
            'You do not own a business this voucher is scoped to.',
          );
        }
        issuerBusinessId = allowed[0];
      } else {
        issuerBusinessId = owned[0];
      }
    }

    const recipient = await this.resolveRecipient(dto);

    if (dto.issuanceId) {
      const existing = await this.dataSource.manager.findOne(UserVoucher, {
        where: { issuanceId: dto.issuanceId },
        relations: ['definition', 'owner'],
      });
      if (existing) {
        const existingOwnerId =
          existing.owner?.id ?? (existing as any).ownerId;
        if (existingOwnerId && existingOwnerId !== recipient.id) {
          throw new BadRequestException(
            'This issuanceId already belongs to a different customer.',
          );
        }
        return existing;
      }
    }
    const faceValue = Number(definition.faceValue);
    const realRatio = Number(definition.splitRatio?.real ?? 0);
    const realTarget = isPriceReducer
      ? 0
      : round2(faceValue * Math.min(1, Math.max(0, realRatio)));
    const rewardAmount = isPriceReducer
      ? 0
      : round2(faceValue - realTarget);

    if (!isPriceReducer && rewardAmount <= 0 && realTarget <= 0) {
      throw new BadRequestException(
        'This definition has no value to issue. Check faceValue and splitRatio.',
      );
    }

    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : definition.expiresAt
        ? new Date(definition.expiresAt)
        : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('expiresAt must be a valid date.');
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      const voucher = new UserVoucher();
      voucher.owner = recipient;
      voucher.definition = definition;
      voucher.code = generateVoucherCode();
      voucher.realBalance = 0;
      voucher.rewardBalance = rewardAmount;
      voucher.faceValue = faceValue;
      voucher.realContributionTarget = isPriceReducer ? 0 : realTarget;
      voucher.cashbackCredited = 0;
      voucher.salesAttributed = 0;
      voucher.functionalType = definition.functionalType;
      voucher.expiresAt = expiresAt;
      voucher.issuedByUserId = actor.id;
      voucher.issuerBusinessId = issuerBusinessId;
      voucher.issuanceId = dto.issuanceId ?? null;
      voucher.state = VoucherState.ACTIVE;

      const savedVoucher = await manager.save(voucher);

      await this.mirrorCreateDigitalValue(
        savedVoucher,
        isPriceReducer ? 0 : rewardAmount,
        recipient.id,
        manager,
        {
          rewardDefinitionId: definition.id,
          functionalType: definition.functionalType,
        },
      );

      if (rewardAmount > 0) {
        const txReward = new VoucherTransaction();
        txReward.voucher = savedVoucher;
        txReward.sourceType = TransactionSourceType.SYSTEM_REWARD;
        txReward.contributorId = 'SYSTEM';
        txReward.contributorType = 'system';
        txReward.amount = rewardAmount;
        txReward.realAmountDelta = 0;
        txReward.rewardAmountDelta = rewardAmount;
        await manager.save(txReward);
      }

      return savedVoucher;
    });

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.ISSUED, {
      kind: this.instrumentKind(saved),
      code: saved.code,
      instrumentId: saved.id,
      userId: recipient.id,
      businessId: issuerBusinessId ?? undefined,
      amount: isPriceReducer ? faceValue : rewardAmount,
      currency: 'GBP',
      source: 'issuance',
      metadata: {
        rewardDefinitionId: definition.id,
        functionalType: definition.functionalType,
        realContributionTarget: realTarget,
        issuanceId: dto.issuanceId ?? null,
      },
    });

    return saved;
  }

  private async resolveRecipient(dto: IssueVoucherDto): Promise<User> {
    if (dto.recipientUserId) {
      const user = await this.dataSource.manager.findOne(User, {
        where: { id: dto.recipientUserId },
      });
      if (!user) throw new NotFoundException('Recipient user not found.');
      return user;
    }

    const email = String(dto.recipientEmail ?? '').trim();
    const user = await this.dataSource.manager.findOne(User, {
      where: { email: ILike(email) },
    });
    if (!user) {
      throw new NotFoundException(
        'No MCOM Mall account exists for that email yet. Ask the customer to sign up first.',
      );
    }
    return user;
  }

  // --- Logic 1: The "Split" Injection (Creation) ---
  async initiatePurchase(
    user: User,
    dto: {
      rewardDefinitionId: string;
      paymentAmount: number;
      paymentGateway: PaymentGateway;
      idempotencyKey?: string;
    },
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string | null;
    transactionId?: string;
    provider: PaymentGateway;
  }> {
    const amount = Number(dto.paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Enter a valid voucher amount.');
    }

    // Validate the amount BEFORE creating a provider payment. Without this a
    // shopper could be charged for an amount the purchase step will reject.
    const definition = await this.dataSource.manager.findOne(RewardDefinition, {
      where: { id: dto.rewardDefinitionId },
    });
    if (!definition) {
      throw new NotFoundException('Reward Definition not found.');
    }
    if (!definition.isActive) {
      throw new BadRequestException(
        'This reward definition is currently inactive.',
      );
    }
    if (definition.functionalType === FunctionalType.PRICE_REDUCER) {
      throw new BadRequestException(
        'Price-reducer instruments are issued, not purchased.',
      );
    }
    if (
      definition.expiresAt &&
      new Date() > new Date(definition.expiresAt)
    ) {
      throw new BadRequestException('This reward definition has expired.');
    }
    if (definition.faceValue !== null && definition.faceValue !== undefined) {
      const realRatio = Number(definition.splitRatio?.real ?? 0);
      const expected = round2(Number(definition.faceValue) * realRatio);
      if (Math.abs(amount - expected) > 0.01) {
        throw new BadRequestException(
          `This voucher costs £${expected.toFixed(2)}. Please pay the exact real-money share.`,
        );
      }
    }

    const metadata = {
      reference: `money-voucher-${dto.rewardDefinitionId}-${user.id}`,
      userId: user.id,
      ...(dto.idempotencyKey ? { idempotencyKey: dto.idempotencyKey } : {}),
      description: 'MCOM Mall reward voucher purchase',
    };

    if (dto.paymentGateway === PaymentGateway.MCOM_WALLET) {
      if (!user.centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      const charge = await this.paymentProviderService.createWalletCharge(
        amount,
        'GBP',
        metadata,
        user.centralUserId,
      );
      return {
        provider: PaymentGateway.MCOM_WALLET,
        transactionId: charge.chargeId,
      };
    }

    if (dto.paymentGateway === PaymentGateway.STRIPE) {
      const intent =
        await this.paymentProviderService.createStripePaymentIntent(
          amount,
          'GBP',
          metadata,
        );
      return {
        provider: PaymentGateway.STRIPE,
        clientSecret: intent.client_secret ?? undefined,
      };
    }

    if (dto.paymentGateway === PaymentGateway.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        amount,
        'GBP',
        metadata,
      );
      return {
        provider: PaymentGateway.PAYPAL,
        orderId: order.id,
        approvalUrl: order.approvalUrl ?? null,
      };
    }

    throw new BadRequestException('Unsupported payment gateway');
  }

  async purchaseVoucher(
    userId: string,
    dto: PurchaseVoucherDto,
  ): Promise<UserVoucher> {
    // 1. Verify Payment with Provider
    const currency = 'gbp'; // Default currency for now
    let verification: { ok: boolean; reason?: string };

    if (dto.paymentGateway === PaymentGateway.STRIPE) {
      verification =
        await this.paymentProviderService.verifyStripePaymentIntent(
          dto.transactionId,
          dto.paymentAmount,
          currency,
        );
    } else if (dto.paymentGateway === PaymentGateway.PAYPAL) {
      verification =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          dto.transactionId,
          dto.paymentAmount,
          currency,
        );
    } else if (dto.paymentGateway === PaymentGateway.MCOM_WALLET) {
      verification = await this.paymentProviderService.verifyWalletCharge(
        dto.transactionId,
        dto.paymentAmount,
        'GBP',
      );
    } else {
      throw new BadRequestException('Unsupported payment gateway');
    }

    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.reason}`,
      );
    }

    // 2. Proceed with Voucher Creation. A failure after the provider charge has
    // already been verified is compensated with a refund.
    const issuanceId = `purchase:${dto.paymentGateway}:${dto.transactionId}`;
    let saved: UserVoucher;
    try {
      saved = await this.dataSource.transaction(async (manager) => {
        // Correct idempotency: the same provider transaction always returns the
        // same wallet, never "the user's latest wallet".
        const existingVoucher = await manager.findOne(UserVoucher, {
          where: { issuanceId },
        });
        if (existingVoucher) return existingVoucher;

        const existingHistory = await manager.findOne(PaymentHistory, {
          where: { transactionId: dto.transactionId },
        });
        if (existingHistory) {
          const replay = await manager.findOne(UserVoucher, {
            where: { issuanceId },
          });
          if (replay) return replay;
        }

        const definition = await manager.findOne(RewardDefinition, {
          where: { id: dto.rewardDefinitionId },
        });

        if (!definition) {
          throw new NotFoundException('Reward Definition not found');
        }

        if (!definition.isActive) {
          throw new BadRequestException(
            'This reward definition is currently inactive',
          );
        }

        if (definition.functionalType === FunctionalType.PRICE_REDUCER) {
          throw new BadRequestException(
            'Price-reducer instruments are issued, not purchased. Use the issuance flow instead.',
          );
        }

        if (definition.expiresAt && new Date() > new Date(definition.expiresAt)) {
          throw new BadRequestException('This reward definition has expired.');
        }

        // Calculate Split
        const realRatio = Number(definition.splitRatio.real);
        if (!Number.isFinite(realRatio) || realRatio <= 0 || realRatio > 1) {
          throw new BadRequestException('Invalid Real Ratio configuration');
        }

        const paymentAmount = Number(dto.paymentAmount);
        let totalValue: number;
        let rewardAmount: number;

        if (
          definition.faceValue !== null &&
          definition.faceValue !== undefined
        ) {
          totalValue = Number(definition.faceValue);
          const expectedPayment = round2(totalValue * realRatio);
          if (Math.abs(paymentAmount - expectedPayment) > 0.01) {
            throw new BadRequestException(
              `Payment amount must be £${expectedPayment.toFixed(2)} for a £${totalValue.toFixed(2)} voucher.`,
            );
          }
          rewardAmount = round2(totalValue - paymentAmount);
        } else {
          totalValue = round2(paymentAmount / realRatio);
          rewardAmount = round2(totalValue - paymentAmount);
        }

        // Create Voucher
        const voucher = new UserVoucher();
        voucher.owner = { id: userId } as User;
        voucher.definition = definition;
        voucher.code = generateVoucherCode();
        voucher.realBalance = paymentAmount;
        voucher.rewardBalance = rewardAmount;
        voucher.faceValue = totalValue;
        // The buyer already paid the real share; friends/family cannot top it up.
        voucher.realContributionTarget = paymentAmount;
        voucher.functionalType = definition.functionalType;
        voucher.cashbackCredited = 0;
        voucher.salesAttributed = 0;
        voucher.expiresAt = definition.expiresAt
          ? new Date(definition.expiresAt)
          : null;
        voucher.issuanceId = issuanceId;
        voucher.state = VoucherState.ACTIVE;

        const savedVoucher = await manager.save(voucher);

        await this.mirrorCreateDigitalValue(
          savedVoucher,
          totalValue,
          userId,
          manager,
          { rewardDefinitionId: definition.id },
        );

        // Record Transactions
        // 1. Audit Table (General Payment History)
        const paymentHistory = new PaymentHistory();
        paymentHistory.user = { id: userId } as User;
        paymentHistory.amountPaid = paymentAmount;
        paymentHistory.transactionId = dto.transactionId;
        paymentHistory.paymentGateway = dto.paymentGateway;
        paymentHistory.purpose = PaymentPurpose.VOUCHER_PURCHASE;
        paymentHistory.currency = currency;
        await manager.save(paymentHistory);

        // 2. Voucher Internal Transactions (Wallet)
        const txDeposit = new VoucherTransaction();
        txDeposit.voucher = savedVoucher;
        txDeposit.sourceType = TransactionSourceType.USER_DEPOSIT;
        txDeposit.contributorId = userId;
        txDeposit.contributorType = 'user';
        txDeposit.amount = paymentAmount;
        txDeposit.realAmountDelta = paymentAmount;
        txDeposit.rewardAmountDelta = 0;
        await manager.save(txDeposit);

        const txReward = new VoucherTransaction();
        txReward.voucher = savedVoucher;
        txReward.sourceType = TransactionSourceType.SYSTEM_REWARD;
        txReward.contributorId = 'SYSTEM';
        txReward.contributorType = 'system';
        txReward.amount = rewardAmount;
        txReward.realAmountDelta = 0;
        txReward.rewardAmountDelta = rewardAmount;
        await manager.save(txReward);

        return savedVoucher;
      });
    } catch (error) {
      // The provider payment was verified above, so a failure here must not
      // leave the shopper charged without a wallet.
      await this.refundPayment(
        dto.paymentGateway,
        dto.transactionId,
        Number(dto.paymentAmount),
      );
      throw error;
    }

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.ISSUED, {
      kind: this.instrumentKind(saved),
      code: saved.code,
      instrumentId: saved.id,
      userId,
      amount: Number(saved.realBalance) + Number(saved.rewardBalance),
      currency: 'GBP',
      source: 'purchase',
      metadata: {
        rewardDefinitionId: dto.rewardDefinitionId,
        paymentAmount: Number(dto.paymentAmount),
        realAmount: Number(saved.realBalance),
        rewardAmount: Number(saved.rewardBalance),
      },
    });

    return saved;
  }

  /**
   * Verify a provider payment before crediting a wallet. Shared by purchase
   * and contribution flows so the verification rules cannot drift.
   */
  private async verifyPayment(
    gateway: PaymentGateway,
    transactionId: string,
    amount: number,
  ): Promise<void> {
    let result: { ok: boolean; reason?: string };

    if (gateway === PaymentGateway.STRIPE) {
      result = await this.paymentProviderService.verifyStripePaymentIntent(
        transactionId,
        amount,
        'gbp',
      );
    } else if (gateway === PaymentGateway.PAYPAL) {
      result =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          transactionId,
          amount,
          'gbp',
        );
    } else if (gateway === PaymentGateway.MCOM_WALLET) {
      result = await this.paymentProviderService.verifyWalletCharge(
        transactionId,
        amount,
        'GBP',
      );
    } else {
      throw new BadRequestException('Unsupported payment gateway');
    }

    if (!result.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${result.reason}`,
      );
    }
  }

  /**
   * Friends/family contribution into an existing wallet, up to its face-value
   * target. The contributor does not need to own the wallet; the credit is
   * recorded against their user id so the funding history stays auditable.
   */
  async contributeToVoucher(
    code: string,
    dto: ContributeToVoucherDto,
    contributor: User,
  ): Promise<UserVoucher> {
    const amount = round2(Number(dto.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Contribution amount must be positive.');
    }

    await this.verifyPayment(dto.paymentGateway, dto.transactionId, amount);

    let credited: UserVoucher;
    try {
      credited = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(PaymentHistory, {
        where: { transactionId: dto.transactionId },
      });

      const locked = await manager.findOne(UserVoucher, {
        where: { code },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      if (!locked) {
        throw new NotFoundException('Voucher not found.');
      }

      const voucher =
        (await manager.findOne(UserVoucher, {
          where: { id: locked.id },
          relations: ['definition', 'definition.validShops', 'owner'],
        })) ?? locked;

      // Idempotent replay: the payment was already credited.
      if (existing) return voucher;

      if (voucher.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Voucher is not active.');
      }
      if (this.isExpired(voucher)) {
        voucher.state = VoucherState.EXPIRED;
        await manager.save(voucher);
        throw new BadRequestException('Voucher has expired.');
      }
      if (this.isPriceReducer(voucher)) {
        throw new BadRequestException(
          'A Voucher Coupon is a discount entitlement and cannot be topped up.',
        );
      }

      const realBalance = round2(Number(voucher.realBalance));
      const realRatio = Number(voucher.definition?.splitRatio?.real ?? 0);
      const realTarget =
        voucher.realContributionTarget ??
        (voucher.faceValue !== null && voucher.faceValue !== undefined
          ? realRatio > 0
            ? round2(Number(voucher.faceValue) * realRatio)
            : round2(
                Math.max(
                  0,
                  Number(voucher.faceValue) - Number(voucher.rewardBalance),
                ),
              )
          : null);

      if (
        realTarget !== null &&
        realBalance + amount > Number(realTarget) + 0.001
      ) {
        const remaining = round2(Math.max(0, Number(realTarget) - realBalance));
        throw new BadRequestException(
          `This voucher only needs £${remaining.toFixed(2)} more real money to reach its target.`,
        );
      }

      // Legacy definitions without a contribution target keep the total-value cap.
      if (realTarget === null) {
        const totalBalance = round2(
          realBalance + Number(voucher.rewardBalance),
        );
        const totalTarget =
          voucher.faceValue ?? voucher.definition?.faceValue ?? null;
        if (
          totalTarget !== null &&
          totalBalance + amount > Number(totalTarget) + 0.001
        ) {
          const remaining = round2(
            Math.max(0, Number(totalTarget) - totalBalance),
          );
          throw new BadRequestException(
            `This voucher only needs £${remaining.toFixed(2)} more to reach its £${Number(totalTarget).toFixed(2)} target.`,
          );
        }
      }

      voucher.realBalance = round2(realBalance + amount);
      await manager.save(voucher);
      await this.mirrorFundDigitalValue(voucher.code, amount, manager);

      const paymentHistory = new PaymentHistory();
      paymentHistory.user = { id: contributor.id } as User;
      paymentHistory.amountPaid = amount;
      paymentHistory.transactionId = dto.transactionId;
      paymentHistory.paymentGateway = dto.paymentGateway;
      paymentHistory.purpose = PaymentPurpose.PAYG_TOPUP;
      paymentHistory.currency = 'GBP';
      await manager.save(paymentHistory);

      const tx = new VoucherTransaction();
      tx.voucher = voucher;
      tx.sourceType = TransactionSourceType.USER_DEPOSIT;
      tx.contributorId = contributor.id;
      tx.contributorType = 'user';
      tx.amount = amount;
      tx.realAmountDelta = amount;
      tx.rewardAmountDelta = 0;
      await manager.save(tx);

      return voucher;
      });
    } catch (error) {
      await this.refundContribution(
        dto.paymentGateway,
        dto.transactionId,
        amount,
      );
      throw error;
    }

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.CREDITED, {
      kind: this.instrumentKind(credited),
      code: credited.code,
      instrumentId: credited.id,
      userId: (credited as any).ownerId,
      amount,
      currency: 'GBP',
      source: 'contribution',
      metadata: { contributorId: contributor.id },
    });

    return credited;
  }

  /**
   * Best-effort compensating refund when a contribution was verified but the
   * credit transaction failed. The provider refund is idempotent.
   */
  private async refundContribution(
    gateway: PaymentGateway,
    transactionId: string,
    amount: number,
  ): Promise<void> {
    await this.refundPayment(gateway, transactionId, amount);
  }

  /**
   * Best-effort compensating refund. `refundStripePayment` already delegates to
   * MCOM Pay when the charge id resolves, so it covers STRIPE and MCOM_WALLET.
   */
  private async refundPayment(
    gateway: PaymentGateway,
    transactionId: string,
    amount: number,
  ): Promise<void> {
    try {
      if (gateway === PaymentGateway.PAYPAL) {
        await this.paymentProviderService.refundPaypalOrder(
          transactionId,
          amount,
          'GBP',
        );
      } else {
        await this.paymentProviderService.refundStripePayment(
          transactionId,
          amount,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Compensating refund failed for ${gateway} ${transactionId}: ${error?.message ?? error}`,
      );
    }
  }

  /**
   * Start a contribution payment. Validates the wallet target before charging
   * so a contributor never pays for value the wallet cannot accept.
   */
  async initiateContribution(
    code: string,
    dto: InitiateContributionDto,
    user: User,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string | null;
    transactionId?: string;
    provider: PaymentGateway;
  }> {
    const amount = round2(Number(dto.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Enter a valid contribution amount.');
    }

    const voucher = await this.dataSource.manager.findOne(UserVoucher, {
      where: { code },
      relations: ['definition'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }

    if (voucher.state !== VoucherState.ACTIVE) {
      throw new BadRequestException('Voucher is not active.');
    }
    if (this.isExpired(voucher)) {
      throw new BadRequestException('Voucher has expired.');
    }
    if (this.isPriceReducer(voucher)) {
      throw new BadRequestException(
        'A Voucher Coupon is a discount entitlement and cannot be topped up.',
      );
    }

    const realBalance = round2(Number(voucher.realBalance));
    const realRatio = Number(voucher.definition?.splitRatio?.real ?? 0);
    const realTarget =
      voucher.realContributionTarget ??
      (voucher.faceValue !== null && voucher.faceValue !== undefined
        ? realRatio > 0
          ? round2(Number(voucher.faceValue) * realRatio)
          : round2(
              Math.max(
                0,
                Number(voucher.faceValue) - Number(voucher.rewardBalance),
              ),
            )
        : null);

    if (
      realTarget !== null &&
      realBalance + amount > Number(realTarget) + 0.001
    ) {
      const remaining = round2(Math.max(0, Number(realTarget) - realBalance));
      throw new BadRequestException(
        `This voucher only needs £${remaining.toFixed(2)} more real money to reach its target.`,
      );
    }

    if (realTarget === null) {
      const totalBalance = round2(
        realBalance + Number(voucher.rewardBalance),
      );
      const totalTarget =
        voucher.faceValue ?? voucher.definition?.faceValue ?? null;
      if (
        totalTarget !== null &&
        totalBalance + amount > Number(totalTarget) + 0.001
      ) {
        const remaining = round2(
          Math.max(0, Number(totalTarget) - totalBalance),
        );
        throw new BadRequestException(
          `This voucher only needs £${remaining.toFixed(2)} more to reach its £${Number(totalTarget).toFixed(2)} target.`,
        );
      }
    }

    const metadata = {
      reference: `money-voucher-contribution-${code}-${user.id}`,
      userId: user.id,
      description: 'MCOM Mall voucher contribution',
    };

    if (dto.paymentGateway === PaymentGateway.MCOM_WALLET) {
      if (!user.centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      const charge = await this.paymentProviderService.createWalletCharge(
        amount,
        'GBP',
        metadata,
        user.centralUserId,
      );
      return {
        provider: PaymentGateway.MCOM_WALLET,
        transactionId: charge.chargeId,
      };
    }

    if (dto.paymentGateway === PaymentGateway.STRIPE) {
      const intent =
        await this.paymentProviderService.createStripePaymentIntent(
          amount,
          'GBP',
          metadata,
        );
      return {
        provider: PaymentGateway.STRIPE,
        clientSecret: intent.client_secret ?? undefined,
      };
    }

    if (dto.paymentGateway === PaymentGateway.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        amount,
        'GBP',
        metadata,
      );
      return {
        provider: PaymentGateway.PAYPAL,
        orderId: order.id,
        approvalUrl: order.approvalUrl ?? null,
      };
    }

    throw new BadRequestException('Unsupported payment gateway');
  }

  // --- Logic 2: The "Cashback" Loop (The Trigger) ---
  async injectCashback(
    dto: CashbackInjectionDto,
    actor: User,
  ): Promise<UserVoucher> {
    const credited = await this.dataSource.transaction(async (manager) => {
      await this.assertBusinessOwnership(manager, dto.shopId, actor);

      const voucher = await manager.findOne(UserVoucher, {
        where: { id: dto.userVoucherId },
        relations: ['definition', 'definition.validShops'],
      });

      if (!voucher) {
        throw new NotFoundException('User Voucher not found');
      }

      if (voucher.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Voucher is not active');
      }
      if (this.isExpired(voucher)) {
        voucher.state = VoucherState.EXPIRED;
        await manager.save(voucher);
        throw new BadRequestException('Voucher has expired');
      }
      if (this.isPriceReducer(voucher)) {
        throw new BadRequestException(
          'Voucher Coupons are discounts and cannot receive cashback.',
        );
      }

      await this.validateScope(
        manager,
        voucher.definition,
        dto.shopId,
        true,
      );

      const amount = round2(Number(dto.amount));
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Cashback amount must be positive.');
      }

      const faceValue = Number(voucher.faceValue ?? 0);
      const capPercent = Number(voucher.definition?.maxCashbackPercent ?? 50);
      const cap =
        faceValue > 0
          ? Number(((faceValue * capPercent) / 100).toFixed(2))
          : null;
      const alreadyCredited = Number(voucher.cashbackCredited ?? 0);

      // The cap is a core rule of the money engine, not an optional rollout.
      if (cap !== null && alreadyCredited + amount > cap + 0.001) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: this.instrumentKind(voucher),
          code: voucher.code,
          instrumentId: voucher.id,
          businessId: dto.shopId,
          amount,
          reason: 'cashback_cap_exceeded',
          source: 'cashback',
          metadata: { cap, alreadyCredited },
        });
        throw new BadRequestException(
          `Cashback cap of £${cap.toFixed(2)} reached for this voucher.`,
        );
      }

      voucher.rewardBalance = round2(
        Number(voucher.rewardBalance) + amount,
      );
      voucher.cashbackCredited = round2(alreadyCredited + amount);

      await manager.save(voucher);
      await this.mirrorFundDigitalValue(voucher.code, amount, manager);

      const tx = new VoucherTransaction();
      tx.voucher = voucher;
      tx.sourceType = TransactionSourceType.BUSINESS_CASHBACK;
      tx.contributorId = dto.shopId;
      tx.contributorType = 'business';
      tx.businessId = dto.shopId;
      tx.amount = amount;
      tx.realAmountDelta = 0;
      tx.rewardAmountDelta = amount;

      await manager.save(tx);

      return voucher;
    });

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.CREDITED, {
      kind: this.instrumentKind(credited),
      code: credited.code,
      instrumentId: credited.id,
      userId: (credited as any).ownerId,
      businessId: dto.shopId,
      amount: Number(dto.amount),
      currency: 'GBP',
      source: 'cashback',
      metadata: {
        rewardDefinitionId: (credited.definition as any)?.id ?? null,
        cashbackCredited: Number(credited.cashbackCredited ?? 0),
      },
    });

    return credited;
  }

  // --- Logic 3: The Spending Guard (The Lock) ---
  /**
   * Customer-initiated spend. The caller must own the wallet.
   * Business-initiated POS spend uses `posSpend`, which checks shop ownership.
   */
  async spend(dto: SpendDto, actor: User): Promise<UserVoucher> {
    return this.performSpend(dto, actor, 'owner');
  }

  async posSpend(dto: SpendDto, actor: User): Promise<UserVoucher> {
    return this.performSpend(dto, actor, 'pos');
  }

  private async performSpend(
    dto: SpendDto,
    actor: User,
    mode: 'owner' | 'pos',
  ): Promise<UserVoucher> {
    const spendAmount = round2(Number(dto.amount));
    if (!Number.isFinite(spendAmount) || spendAmount <= 0) {
      throw new BadRequestException('Spend amount must be positive.');
    }

    const spent = await this.dataSource.transaction(async (manager) => {
      if (mode === 'pos') {
        await this.assertBusinessOwnership(manager, dto.shopId, actor);
      }

      const lockedVoucher = await manager.findOne(UserVoucher, {
        where: { id: dto.userVoucherId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      const voucher = lockedVoucher
        ? ((await manager.findOne(UserVoucher, {
            where: { id: lockedVoucher.id },
            relations: ['definition', 'definition.validShops', 'owner'],
          })) ?? lockedVoucher)
        : null;

      if (!voucher) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: 'money_voucher',
          instrumentId: dto.userVoucherId,
          businessId: dto.shopId,
          amount: spendAmount,
          reason: 'voucher_not_found',
          source: mode === 'pos' ? 'pos' : 'spend',
        });
        throw new NotFoundException('User Voucher not found');
      }

      if (mode === 'owner' && actor.role !== UserRole.ADMIN) {
        const ownerId = voucher.owner?.id ?? (voucher as any).ownerId;
        if (!ownerId || ownerId !== actor.id) {
          this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
            kind: this.instrumentKind(voucher),
            code: voucher.code,
            instrumentId: voucher.id,
            amount: spendAmount,
            reason: 'not_owner',
            source: 'spend',
          });
          throw new ForbiddenException(
            'You do not have permission to spend this voucher.',
          );
        }
      }

      if (voucher.state !== VoucherState.ACTIVE) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: this.instrumentKind(voucher),
          code: voucher.code,
          instrumentId: voucher.id,
          businessId: dto.shopId,
          amount: spendAmount,
          reason: 'voucher_inactive',
          source: mode === 'pos' ? 'pos' : 'spend',
        });
        throw new BadRequestException('Voucher is not active');
      }
      if (this.isExpired(voucher)) {
        voucher.state = VoucherState.EXPIRED;
        await manager.save(voucher);
        throw new BadRequestException('Voucher has expired');
      }

      if (!voucher.definition) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: 'money_voucher',
          code: voucher.code,
          instrumentId: voucher.id,
          businessId: dto.shopId,
          amount: spendAmount,
          reason: 'definition_missing',
          source: mode === 'pos' ? 'pos' : 'spend',
        });
        throw new BadRequestException('Voucher definition missing');
      }

      if (this.isPriceReducer(voucher)) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: this.instrumentKind(voucher),
          code: voucher.code,
          instrumentId: voucher.id,
          businessId: dto.shopId,
          amount: spendAmount,
          reason: 'price_reducer_requires_discount_path',
          source: mode === 'pos' ? 'pos' : 'spend',
        });
        throw new BadRequestException(
          'This instrument can only be applied as a discount at checkout.',
        );
      }

      await this.validateScope(manager, voucher.definition, dto.shopId);

      const totalBalance = round2(
        Number(voucher.realBalance) + Number(voucher.rewardBalance),
      );

      if (totalBalance < spendAmount) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: this.instrumentKind(voucher),
          code: voucher.code,
          instrumentId: voucher.id,
          businessId: dto.shopId,
          amount: spendAmount,
          reason: 'insufficient_funds',
          source: mode === 'pos' ? 'pos' : 'spend',
          metadata: { balance: totalBalance },
        });
        throw new BadRequestException('Insufficient funds');
      }

      const realBal = Number(voucher.realBalance);
      const rewardBal = Number(voucher.rewardBalance);
      const { realDeduction, rewardDeduction } = this.computeBurn(
        voucher,
        spendAmount,
      );

      const salesImpactBefore = round2(Number(voucher.salesAttributed ?? 0));
      const salesImpactAfter = round2(salesImpactBefore + spendAmount);

      voucher.realBalance = round2(realBal - realDeduction);
      voucher.rewardBalance = round2(rewardBal - rewardDeduction);
      voucher.salesAttributed = salesImpactAfter;

      if (voucher.realBalance + voucher.rewardBalance <= 0) {
        voucher.state = VoucherState.DEPLETED;
      }

      await manager.save(voucher);
      await this.mirrorRedeemDigitalValue(voucher.code, spendAmount, manager);

      const tx = new VoucherTransaction();
      tx.voucher = voucher;
      tx.sourceType = TransactionSourceType.SPEND;
      tx.contributorId = dto.shopId;
      tx.contributorType = 'business';
      tx.businessId = dto.shopId;
      tx.amount = -spendAmount;
      tx.realAmountDelta = -realDeduction;
      tx.rewardAmountDelta = -rewardDeduction;
      tx.salesImpactBefore = salesImpactBefore;
      tx.salesImpactAfter = salesImpactAfter;

      await manager.save(tx);

      return voucher;
    });

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.APPLIED, {
      kind: this.instrumentKind(spent),
      code: spent.code,
      instrumentId: spent.id,
      userId: (spent as any).ownerId,
      businessId: dto.shopId,
      amount: spendAmount,
      currency: 'GBP',
      source: mode === 'pos' ? 'pos' : 'spend',
      metadata: {
        remainingReal: Number(spent.realBalance),
        remainingReward: Number(spent.rewardBalance),
        state: spent.state,
      },
    });

    return spent;
  }

  // --- Checkout / booking redemption (spend-like instruments) ---

  /**
   * Resolve a wallet by code for the authenticated owner. Used by checkout and
   * booking before applying it, so the caller can compute the eligible amount.
   */
  async getOwnedByCode(
    code: string,
    user: { id: string },
  ): Promise<UserVoucher> {
    await this.expireStaleVouchers();
    const voucher = await this.dataSource.manager.findOne(UserVoucher, {
      where: { code },
      relations: ['definition', 'definition.validShops', 'owner'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }
    const ownerId = voucher.owner?.id ?? (voucher as any).ownerId;
    if (!ownerId || ownerId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to use this voucher.',
      );
    }
    if (this.isExpired(voucher) && voucher.state === VoucherState.ACTIVE) {
      voucher.state = VoucherState.EXPIRED;
      await this.dataSource.manager.save(voucher);
    }
    return voucher;
  }

  /**
   * Resolve a Voucher Coupon for the discount slot and compute how much of the
   * eligible subtotal it can remove. Does not consume it.
   */
  async resolvePriceReducer(
    code: string,
    user: { id: string },
    eligibleSubtotal: number,
  ): Promise<{ voucher: UserVoucher; amount: number }> {
    const voucher = await this.getOwnedByCode(code, user);
    if (!this.isPriceReducer(voucher)) {
      throw new BadRequestException(
        'This instrument is a spending wallet, not a discount.',
      );
    }
    if (voucher.state !== VoucherState.ACTIVE) {
      throw new BadRequestException('Voucher Coupon is not active.');
    }
    if (this.isExpired(voucher)) {
      throw new BadRequestException('Voucher Coupon has expired.');
    }
    const entitlement = round2(Number(voucher.faceValue ?? 0));
    if (entitlement <= 0) {
      throw new BadRequestException(
        'This Voucher Coupon has no discount value configured.',
      );
    }
    const amount = round2(
      Math.min(entitlement, Math.max(0, Number(eligibleSubtotal) || 0)),
    );
    if (amount <= 0) {
      throw new BadRequestException(
        'This Voucher Coupon does not apply to any item in the cart.',
      );
    }
    return { voucher, amount };
  }

  /**
   * Map a definition's business-level `scopeType` onto the shared instrument
   * scope model used by checkout and booking. `any_shop` is unrestricted;
   * the other modes are listing-bound via `validShops`.
   *
   * Expo/campaign ids are not modelled yet, so those scopes fall back to the
   * definition's listing allow-list. An empty allow-list fails closed.
   */
  getScopeForDefinition(
    definition: RewardDefinition | null | undefined,
  ): NormalisedScope | null {
    if (!definition) return null;

    const productIds = (definition.validProductIds ?? []).filter(Boolean);
    const serviceIds = (definition.validServiceIds ?? []).filter(Boolean);
    if (productIds.length > 0 || serviceIds.length > 0) {
      return {
        mode: ScopeMode.ITEMS,
        businessId: null,
        // Keep any listing allow-list so item scope can never escape its shops.
        listingIds: (definition.validShops ?? [])
          .map((shop) => shop.id)
          .filter(Boolean),
        productIds,
        serviceIds,
      };
    }

    if (definition.scopeType === ScopeType.ANY_SHOP) {
      return null;
    }

    const listingIds = (definition.validShops ?? [])
      .map((shop) => shop.id)
      .filter(Boolean);

    if (listingIds.length === 0) {
      throw new UnprocessableEntityException(
        'SCOPE_EMPTY: this voucher is restricted but has no eligible listings.',
      );
    }

    return {
      mode: ScopeMode.LISTINGS,
      businessId: null,
      listingIds,
      productIds: [],
      serviceIds: [],
    };
  }

  private assertSpendable(voucher: UserVoucher): void {
    if (voucher.state !== VoucherState.ACTIVE) {
      throw new BadRequestException('Voucher is not active.');
    }
    if (this.isExpired(voucher)) {
      throw new BadRequestException('Voucher has expired.');
    }
    if (this.isPriceReducer(voucher)) {
      throw new BadRequestException(
        'This instrument can only be applied as a discount, not as payment.',
      );
    }
  }

  private computeBurn(
    voucher: UserVoucher,
    amount: number,
  ): { realDeduction: number; rewardDeduction: number } {
    const realBal = Number(voucher.realBalance);
    const rewardBal = Number(voucher.rewardBalance);
    const strategy =
      voucher.definition?.burnStrategy ?? BurnStrategy.REAL_FIRST;

    if (strategy === BurnStrategy.REWARD_FIRST) {
      if (rewardBal >= amount) {
        return { realDeduction: 0, rewardDeduction: amount };
      }
      return {
        realDeduction: round2(amount - rewardBal),
        rewardDeduction: rewardBal,
      };
    }

    if (strategy === BurnStrategy.PROPORTIONAL && realBal + rewardBal > 0) {
      const realDeduction = round2((amount * realBal) / (realBal + rewardBal));
      return {
        realDeduction,
        rewardDeduction: round2(amount - realDeduction),
      };
    }

    if (realBal >= amount) {
      return { realDeduction: amount, rewardDeduction: 0 };
    }
    return {
      realDeduction: realBal,
      rewardDeduction: round2(amount - realBal),
    };
  }

  private async redeemInstrument(
    input: {
      code: string;
      amount: number;
      userId: string;
      businessId?: string | null;
      referenceId?: string | null;
      source: 'checkout' | 'booking';
    },
    manager?: EntityManager,
  ): Promise<RedemptionResult> {
    const amount = round2(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Redemption amount must be positive.');
    }

    const run = async (tx: EntityManager): Promise<RedemptionResult> => {
      const repo = tx.getRepository(UserVoucher);
      const locked = await repo.findOne({
        where: { code: input.code },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      if (!locked) {
        throw new NotFoundException('Voucher not found.');
      }

      const voucher =
        (await repo.findOne({
          where: { id: locked.id },
          relations: ['definition', 'definition.validShops', 'owner'],
        })) ?? locked;

      const ownerId = voucher.owner?.id ?? (voucher as any).ownerId;
      if (!ownerId || ownerId !== input.userId) {
        throw new ForbiddenException(
          'You do not have permission to use this voucher.',
        );
      }

      this.assertSpendable(voucher);

      const totalBalance = round2(
        Number(voucher.realBalance) + Number(voucher.rewardBalance),
      );
      if (amount > totalBalance) {
        throw new BadRequestException('Voucher amount exceeds balance.');
      }

      const { realDeduction, rewardDeduction } = this.computeBurn(
        voucher,
        amount,
      );
      const salesImpactBefore = round2(Number(voucher.salesAttributed ?? 0));
      const salesImpactAfter = round2(salesImpactBefore + amount);
      voucher.realBalance = round2(Number(voucher.realBalance) - realDeduction);
      voucher.rewardBalance = round2(
        Number(voucher.rewardBalance) - rewardDeduction,
      );
      voucher.salesAttributed = salesImpactAfter;
      if (Number(voucher.realBalance) + Number(voucher.rewardBalance) <= 0) {
        voucher.state = VoucherState.DEPLETED;
      }
      await repo.save(voucher);
      await this.mirrorRedeemDigitalValue(voucher.code, amount, tx);

      const txRow = new VoucherTransaction();
      txRow.voucher = voucher;
      txRow.sourceType = TransactionSourceType.SPEND;
      txRow.contributorId = input.businessId ?? undefined;
      txRow.contributorType = 'business';
      txRow.businessId = input.businessId ?? null;
      txRow.referenceId = input.referenceId ?? null;
      txRow.amount = -amount;
      txRow.realAmountDelta = -realDeduction;
      txRow.rewardAmountDelta = -rewardDeduction;
      txRow.salesImpactBefore = salesImpactBefore;
      txRow.salesImpactAfter = salesImpactAfter;
      await tx.getRepository(VoucherTransaction).save(txRow);

      return { voucher, realDeduction, rewardDeduction };
    };

    const result = manager
      ? await run(manager)
      : await this.dataSource.transaction(run);

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.APPLIED, {
      kind: this.instrumentKind(result.voucher),
      code: result.voucher.code,
      instrumentId: result.voucher.id,
      userId: input.userId,
      businessId: input.businessId ?? undefined,
      amount,
      currency: 'GBP',
      source: input.source,
      metadata: {
        referenceId: input.referenceId ?? null,
        realDeduction: result.realDeduction,
        rewardDeduction: result.rewardDeduction,
      },
    });

    return result;
  }

  async redeemForOrder(
    input: {
      code: string;
      amount: number;
      userId: string;
      businessId?: string | null;
    },
    order?: { id?: string } | null,
    manager?: EntityManager,
  ): Promise<RedemptionResult> {
    return this.redeemInstrument(
      {
        ...input,
        referenceId: order?.id ?? null,
        source: 'checkout',
      },
      manager,
    );
  }

  async redeemForBooking(
    input: {
      code: string;
      amount: number;
      userId: string;
      businessId?: string | null;
      bookingId?: string | null;
    },
    manager?: EntityManager,
  ): Promise<RedemptionResult> {
    return this.redeemInstrument(
      {
        code: input.code,
        amount: input.amount,
        userId: input.userId,
        businessId: input.businessId,
        referenceId: input.bookingId ?? null,
        source: 'booking',
      },
      manager,
    );
  }

  /**
   * Apply a Voucher Coupon (`price_reducer`) as a single-use discount. The
   * entitlement is consumed once; the discount is capped at the entitlement
   * and at the caller-computed eligible subtotal.
   */
  async redeemPriceReducer(
    input: {
      code: string;
      amount: number;
      userId: string;
      businessId?: string | null;
      referenceId?: string | null;
      source: 'checkout' | 'booking';
    },
    manager?: EntityManager,
  ): Promise<{ voucher: UserVoucher; amount: number }> {
    const requested = round2(input.amount);
    if (!Number.isFinite(requested) || requested <= 0) {
      throw new BadRequestException('Discount amount must be positive.');
    }

    const run = async (
      tx: EntityManager,
    ): Promise<{ voucher: UserVoucher; amount: number }> => {
      const repo = tx.getRepository(UserVoucher);
      const locked = await repo.findOne({
        where: { code: input.code },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      if (!locked) throw new NotFoundException('Voucher not found.');

      const voucher =
        (await repo.findOne({
          where: { id: locked.id },
          relations: ['definition', 'definition.validShops', 'owner'],
        })) ?? locked;

      const ownerId = voucher.owner?.id ?? (voucher as any).ownerId;
      if (!ownerId || ownerId !== input.userId) {
        throw new ForbiddenException(
          'You do not have permission to use this voucher.',
        );
      }
      if (voucher.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Voucher is not active.');
      }
      if (this.isExpired(voucher)) {
        voucher.state = VoucherState.EXPIRED;
        await repo.save(voucher);
        throw new BadRequestException('Voucher has expired.');
      }
      if (!this.isPriceReducer(voucher)) {
        throw new BadRequestException(
          'This instrument is a spending wallet, not a discount.',
        );
      }

      const entitlement = round2(Number(voucher.faceValue ?? 0));
      if (entitlement <= 0) {
        throw new BadRequestException(
          'This Voucher Coupon has no discount value configured.',
        );
      }
      const amount = round2(Math.min(requested, entitlement));
      if (amount <= 0) {
        throw new BadRequestException('Discount amount is zero.');
      }

      voucher.state = VoucherState.DEPLETED;
      await repo.save(voucher);

      const txRow = new VoucherTransaction();
      txRow.voucher = voucher;
      txRow.sourceType = TransactionSourceType.SPEND;
      txRow.contributorId = input.businessId ?? undefined;
      txRow.contributorType = 'business';
      txRow.businessId = input.businessId ?? null;
      txRow.referenceId = input.referenceId ?? null;
      txRow.amount = -amount;
      txRow.realAmountDelta = 0;
      txRow.rewardAmountDelta = 0;
      txRow.salesImpactBefore = round2(
        Number(voucher.salesAttributed ?? 0),
      );
      txRow.salesImpactAfter = round2(
        Number(voucher.salesAttributed ?? 0) + amount,
      );
      await tx.getRepository(VoucherTransaction).save(txRow);

      voucher.salesAttributed = txRow.salesImpactAfter;
      await repo.save(voucher);

      return { voucher, amount };
    };

    const result = manager
      ? await run(manager)
      : await this.dataSource.transaction(run);

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.APPLIED, {
      kind: 'voucher_coupon',
      code: result.voucher.code,
      instrumentId: result.voucher.id,
      userId: input.userId,
      businessId: input.businessId ?? undefined,
      amount: result.amount,
      currency: 'GBP',
      source: input.source,
      metadata: {
        referenceId: input.referenceId ?? null,
        singleUse: true,
      },
    });

    return result;
  }

  async transfer(
    fromVoucherId: string,
    toVoucherId: string,
    amount: number,
    actor: User,
  ): Promise<void> {
    let fromVoucher: UserVoucher | null = null;
    let toVoucher: UserVoucher | null = null;

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new BadRequestException('Transfer amount must be positive.');
    }
    const transferAmount = round2(Number(amount));

    await this.dataSource.transaction(async (manager) => {
      const from = await manager.findOne(UserVoucher, {
        where: { id: fromVoucherId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      const to = await manager.findOne(UserVoucher, {
        where: { id: toVoucherId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });

      if (!from || !to) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: 'money_voucher',
          instrumentId: fromVoucherId,
          amount: transferAmount,
          reason: 'voucher_not_found',
          source: 'transfer',
          metadata: { toVoucherId },
        });
        throw new NotFoundException('Voucher not found');
      }

      const fromWithOwner =
        (await manager.findOne(UserVoucher, {
          where: { id: from.id },
          relations: ['owner', 'definition'],
        })) ?? from;
      const fromOwnerId =
        fromWithOwner.owner?.id ?? (from as any).ownerId;
      if (actor.role !== UserRole.ADMIN && fromOwnerId !== actor.id) {
        throw new ForbiddenException(
          'You do not have permission to transfer from this voucher.',
        );
      }
      if (
        fromWithOwner.functionalType === FunctionalType.PRICE_REDUCER ||
        fromWithOwner.definition?.functionalType ===
          FunctionalType.PRICE_REDUCER
      ) {
        throw new BadRequestException(
          'Voucher Coupons are non-transferable discount entitlements.',
        );
      }
      if (fromWithOwner.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Source voucher is not active.');
      }
      if (this.isExpired(fromWithOwner)) {
        fromWithOwner.state = VoucherState.EXPIRED;
        await manager.save(fromWithOwner);
        throw new BadRequestException('Source voucher has expired.');
      }
      const toWithDefinition =
        (await manager.findOne(UserVoucher, {
          where: { id: to.id },
          relations: ['definition'],
        })) ?? to;
      if (
        toWithDefinition.functionalType === FunctionalType.PRICE_REDUCER ||
        toWithDefinition.definition?.functionalType ===
          FunctionalType.PRICE_REDUCER
      ) {
        throw new BadRequestException(
          'Voucher Coupons are non-transferable discount entitlements.',
        );
      }
      if (to.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Destination voucher is not active.');
      }
      if (this.isExpired(to)) {
        to.state = VoucherState.EXPIRED;
        await manager.save(to);
        throw new BadRequestException('Destination voucher has expired.');
      }

      if (from.totalBalance < transferAmount) {
        this.emitInstrumentEvent(INSTRUMENT_EVENTS.REJECTED, {
          kind: 'money_voucher',
          code: from.code,
          instrumentId: from.id,
          amount: transferAmount,
          reason: 'insufficient_funds',
          source: 'transfer',
          metadata: { balance: from.totalBalance },
        });
        throw new BadRequestException('Insufficient funds');
      }

      const total = from.totalBalance;
      const realRatio = Number(from.realBalance) / total;
      const realToMove = round2(transferAmount * realRatio);
      const rewardToMove = round2(transferAmount - realToMove);

      from.realBalance = round2(Number(from.realBalance) - realToMove);
      from.rewardBalance = round2(Number(from.rewardBalance) - rewardToMove);
      to.realBalance = round2(Number(to.realBalance) + realToMove);
      to.rewardBalance = round2(Number(to.rewardBalance) + rewardToMove);

      await manager.save([from, to]);
      await this.mirrorRedeemDigitalValue(from.code, transferAmount, manager);
      await this.mirrorFundDigitalValue(to.code, transferAmount, manager);

      const txFrom = new VoucherTransaction();
      txFrom.voucher = from;
      txFrom.sourceType = TransactionSourceType.PEER_TRANSFER;
      txFrom.contributorId = actor.id;
      txFrom.contributorType = 'user';
      txFrom.referenceId = to.id;
      txFrom.amount = -transferAmount;
      txFrom.realAmountDelta = -realToMove;
      txFrom.rewardAmountDelta = -rewardToMove;

      const txTo = new VoucherTransaction();
      txTo.voucher = to;
      txTo.sourceType = TransactionSourceType.PEER_TRANSFER;
      txTo.contributorId = actor.id;
      txTo.contributorType = 'user';
      txTo.referenceId = from.id;
      txTo.amount = transferAmount;
      txTo.realAmountDelta = realToMove;
      txTo.rewardAmountDelta = rewardToMove;

      await manager.save([txFrom, txTo]);

      fromVoucher = from;
      toVoucher = to;
    });

    this.emitInstrumentEvent(INSTRUMENT_EVENTS.TRANSFERRED, {
      kind: 'money_voucher',
      code: fromVoucher?.code,
      instrumentId: fromVoucher?.id,
      userId: actor.id,
      amount: transferAmount,
      currency: 'GBP',
      source: 'transfer',
      metadata: { toVoucherId, toCode: toVoucher?.code },
    });
  }

  async getUserVouchers(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: UserVoucher[]; count: number }> {
    await this.expireStaleVouchers();
    const [data, count] = await this.dataSource.manager.findAndCount(
      UserVoucher,
      {
        where: { owner: { id: userId } },
        relations: ['definition'],
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  // --- ADMIN METHODS ---

  async getAllVouchers(
    pagination: PaginationQueryDto,
  ): Promise<{ data: UserVoucher[]; count: number }> {
    await this.expireStaleVouchers();
    const [data, count] = await this.dataSource.manager.findAndCount(
      UserVoucher,
      {
        relations: ['definition', 'owner'],
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  // --- DISCOVERY METHODS ---

  /**
   * For Customers: List all active voucher types they can purchase.
   */
  async getPublicDefinitions(
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    // Price reducers are issued (never sold), so they must not appear in the
    // purchase catalogue even while feature flags are being rolled out.
    const [data, count] = await this.dataSource.manager
      .createQueryBuilder(RewardDefinition, 'rd')
      .where('rd.isActive = :isActive', { isActive: true })
      .andWhere('rd.functionalType = :functionalType', {
        functionalType: FunctionalType.SPENDING_POWER,
      })
      .andWhere('(rd."expires_at" IS NULL OR rd."expires_at" > NOW())')
      .orderBy('rd.created_at', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();
    return { data, count };
  }

  /**
   * For Businesses: List all voucher types that are accepted at their shop.
   * Logic:
   * 1. Include ALL definitions where scopeType = ANY_SHOP
   * 2. Include definitions where scopeType = SPECIFIC_SHOPS AND shopId is in validShops
   */
  async getDefinitionsForShop(
    shopId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(RewardDefinition, 'rd')
      .leftJoin('rd.validShops', 'shop')
      .where('rd.isActive = :isActive', { isActive: true })
      .andWhere('(rd."expires_at" IS NULL OR rd."expires_at" > NOW())')
      .andWhere(
        '(rd.scopeType = :anyScope OR (rd.scopeType IN (:...specificScopes) AND shop.id = :shopId))',
        {
          isActive: true,
          anyScope: ScopeType.ANY_SHOP,
          specificScopes: [
            ScopeType.SPECIFIC_SHOPS,
            ScopeType.EXPO_ONLY,
            ScopeType.CAMPAIGN_ONLY,
          ],
          shopId,
        },
      )
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('rd.created_at', 'DESC');

    const [data, count] = await qb.getManyAndCount();
    return { data, count };
  }

  /**
   * For Business Owners: List all voucher types that are accepted at ANY of their shops.
   */
  async getDefinitionsForOwner(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    // 1. Get all shops owned by this user
    const shops = await this.dataSource.manager.find(Business, {
      where: { user: { id: userId } },
      select: ['id'],
    });

    const shopIds = shops.map((s) => s.id);

    if (shopIds.length === 0) {
      // If they own no shops, they still see global vouchers
      return this.getPublicDefinitions(pagination);
    }

    const qb = this.dataSource.manager
      .createQueryBuilder(RewardDefinition, 'rd')
      .leftJoin('rd.validShops', 'shop')
      .where('rd.isActive = :isActive', { isActive: true })
      .andWhere('(rd."expires_at" IS NULL OR rd."expires_at" > NOW())')
      .andWhere(
        '(rd.scopeType = :anyScope OR (rd.scopeType IN (:...specificScopes) AND shop.id IN (:...shopIds)))',
        {
          isActive: true,
          anyScope: ScopeType.ANY_SHOP,
          specificScopes: [
            ScopeType.SPECIFIC_SHOPS,
            ScopeType.EXPO_ONLY,
            ScopeType.CAMPAIGN_ONLY,
          ],
          shopIds,
        },
      )
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('rd.created_at', 'DESC');

    const [data, count] = await qb.getManyAndCount();
    return { data, count };
  }

  async getAllDefinitions(
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    const [data, count] = await this.dataSource.manager.findAndCount(
      RewardDefinition,
      {
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  /**
   * Per-definition performance: issued wallets, attributed sales, outstanding
   * value, cashback credited and redemption rate. Sales are cumulative per
   * wallet (`salesAttributed`) rather than a hardcoded zero.
   */
  async getDefinitionAnalytics(definitionId: string): Promise<any> {
    const definition = await this.dataSource.manager.findOne(RewardDefinition, {
      where: { id: definitionId },
    });
    if (!definition) {
      throw new NotFoundException('Reward Definition not found');
    }

    const row = await this.dataSource.manager
      .createQueryBuilder(UserVoucher, 'uv')
      .select('COUNT(uv.id)', 'issued')
      .addSelect('COALESCE(SUM(uv.salesAttributed), 0)', 'salesAttributed')
      .addSelect(
        `COALESCE(SUM(
          CASE
            WHEN uv."functionalType" = 'price_reducer'
              AND uv.state = 'active'
            THEN uv."faceValue"
            ELSE uv."realBalance" + uv."rewardBalance"
          END
        ), 0)`,
        'outstanding',
      )
      .addSelect(
        'COALESCE(SUM(uv.cashbackCredited), 0)',
        'cashbackCredited',
      )
      .addSelect(
        "COUNT(CASE WHEN uv.state = 'depleted' THEN 1 END)",
        'depleted',
      )
      .addSelect(
        "COUNT(CASE WHEN uv.state = 'active' THEN 1 END)",
        'activeCount',
      )
      .where('uv.definitionId = :definitionId', { definitionId })
      .getRawOne();

    const issued = parseInt(row?.issued ?? '0', 10);
    const depleted = parseInt(row?.depleted ?? '0', 10);
    const activeCount = parseInt(row?.activeCount ?? '0', 10);

    const reward = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .innerJoin('tx.voucher', 'uv')
      .select(
        `COALESCE(SUM(
          CASE
            WHEN tx."sourceType" = 'system_reward'
              OR tx."sourceType" = 'business_cashback'
            THEN tx."rewardAmountDelta"
            ELSE 0
          END
        ), 0)`,
        'rewardGiven',
      )
      .where('uv.definitionId = :definitionId', { definitionId })
      .getRawOne();

    const byBusiness = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .innerJoin('tx.voucher', 'uv')
      .select('COALESCE(CAST(tx.businessId AS text), tx.contributorId)', 'businessId')
      .addSelect(
        `SUM(CASE WHEN tx."sourceType" = 'spend' THEN ABS(tx.amount) ELSE 0 END) / 100.0`,
        'sales',
      )
      .addSelect(
        `SUM(
          CASE WHEN tx."sourceType" = 'business_cashback'
            THEN ABS(tx."rewardAmountDelta") ELSE 0 END
        ) / 100.0`,
        'cashback',
      )
      .addSelect(
        `SUM(
          CASE WHEN tx."sourceType" = 'spend'
            THEN ABS(tx."rewardAmountDelta") ELSE 0 END
        ) / 100.0`,
        'rewardRedeemed',
      )
      .where('uv.definitionId = :definitionId', { definitionId })
      .andWhere("tx.sourceType IN ('spend', 'business_cashback')")
      .groupBy('COALESCE(CAST(tx.businessId AS text), tx.contributorId)')
      .getRawMany();

    const toPounds = (value: unknown) => Math.round(Number(value ?? 0)) / 100;
    const salesAttributed = toPounds(row?.salesAttributed);
    const rewardGiven = toPounds(reward?.rewardGiven);

    return {
      definitionId: definition.id,
      name: definition.name,
      faceValue: definition.faceValue,
      maxCashbackPercent: definition.maxCashbackPercent,
      functionalType: definition.functionalType,
      issued,
      active: activeCount,
      depleted,
      redemptionRate: issued > 0 ? Math.round((depleted / issued) * 100) : 0,
      salesAttributed,
      outstanding: toPounds(row?.outstanding),
      cashbackCredited: toPounds(row?.cashbackCredited),
      rewardGiven,
      // Attributed ROI: value driven through the network per £1 of reward.
      roi: rewardGiven > 0 ? Math.round((salesAttributed / rewardGiven) * 100) / 100 : null,
      byBusiness: byBusiness.map((item) => ({
        businessId: item.businessId,
        sales: Number(item.sales ?? 0),
        cashback: Number(item.cashback ?? 0),
        rewardRedeemed: Number(item.rewardRedeemed ?? 0),
      })),
    };
  }

  /**
   * Platform settlement view: for every business, how much real money and
   * reward value was consumed there, how much cashback it injected, and the
   * network's outstanding reward liability. This is the reconciliation view
   * that backs "businesses never lose real money".
   */
  async getSettlementReport(): Promise<any> {
    const rows = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .select('COALESCE(CAST(tx.businessId AS text), tx.contributorId)', 'businessId')
      .addSelect(
        `SUM(CASE WHEN tx."sourceType" = 'spend'
          THEN ABS(tx."realAmountDelta") ELSE 0 END) / 100.0`,
        'realRedeemed',
      )
      .addSelect(
        `SUM(CASE WHEN tx."sourceType" = 'spend'
          THEN ABS(tx."rewardAmountDelta") ELSE 0 END) / 100.0`,
        'rewardRedeemed',
      )
      .addSelect(
        `SUM(CASE WHEN tx."sourceType" = 'business_cashback'
          THEN ABS(tx."rewardAmountDelta") ELSE 0 END) / 100.0`,
        'cashbackGiven',
      )
      .addSelect(
        `SUM(CASE WHEN tx."sourceType" = 'spend'
          THEN ABS(tx.amount) ELSE 0 END) / 100.0`,
        'salesAttributed',
      )
      .where("tx.sourceType IN ('spend', 'business_cashback')")
      .groupBy('COALESCE(CAST(tx.businessId AS text), tx.contributorId)')
      .getRawMany();

    const outstanding = await this.dataSource.manager
      .createQueryBuilder(UserVoucher, 'uv')
      .select('COALESCE(SUM(uv.rewardBalance), 0) / 100.0', 'reward')
      .addSelect('COALESCE(SUM(uv.realBalance), 0) / 100.0', 'real')
      .where('uv.state = :state', { state: VoucherState.ACTIVE })
      .andWhere(
        "COALESCE(uv.functionalType, '') <> 'price_reducer'",
      )
      .getRawOne();

    return {
      byBusiness: rows.map((row) => ({
        businessId: row.businessId,
        realRedeemed: Number(row.realRedeemed ?? 0),
        rewardRedeemed: Number(row.rewardRedeemed ?? 0),
        cashbackGiven: Number(row.cashbackGiven ?? 0),
        salesAttributed: Number(row.salesAttributed ?? 0),
      })),
      outstanding: {
        real: Number(outstanding?.real ?? 0),
        reward: Number(outstanding?.reward ?? 0),
        total: Number(outstanding?.real ?? 0) + Number(outstanding?.reward ?? 0),
      },
    };
  }

  // --- CUSTOMER ANALYTICS ---

  async getCustomerStats(userId: string): Promise<any> {
    // 1. Current Snapshot (Active spending wallets only). Voucher Coupons are
    // discount entitlements, not money, so they must not inflate "spending
    // power" balances.
    const { sumReal, sumReward, countActive, countPriceReducers } =
      await this.dataSource.manager
        .createQueryBuilder(UserVoucher, 'uv')
        .select(
          "SUM(CASE WHEN COALESCE(uv.functionalType, '') <> 'price_reducer' THEN uv.realBalance ELSE 0 END) / 100.0",
          'sumReal',
        )
        .addSelect(
          "SUM(CASE WHEN COALESCE(uv.functionalType, '') <> 'price_reducer' THEN uv.rewardBalance ELSE 0 END) / 100.0",
          'sumReward',
        )
        .addSelect(
          "COUNT(CASE WHEN COALESCE(uv.functionalType, '') <> 'price_reducer' THEN 1 END)",
          'countActive',
        )
        .addSelect(
          "COUNT(CASE WHEN uv.functionalType = 'price_reducer' THEN 1 END)",
          'countPriceReducers',
        )
        .where('uv.ownerId = :userId', { userId })
        .andWhere('uv.state = :state', { state: VoucherState.ACTIVE })
        .getRawOne();

    const currentRealBalance = parseFloat(sumReal || 0);
    const currentRewardBalance = parseFloat(sumReward || 0);
    const activeVouchersCount = parseInt(countActive || 0, 10);
    const activeVoucherCouponsCount = parseInt(countPriceReducers || 0, 10);

    // 2. Lifetime Business Rewards (Cashback received from shops)
    const businessRewards = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .innerJoin('tx.voucher', 'voucher')
      .select('SUM(tx.rewardAmountDelta) / 100.0', 'sum')
      .where('voucher.ownerId = :userId', { userId })
      .andWhere('tx.sourceType = :type', {
        type: TransactionSourceType.BUSINESS_CASHBACK,
      })
      .getRawOne();

    const totalBusinessRewardsReceived = parseFloat(businessRewards?.sum || 0);

    // 3. Lifetime Spend
    const totalSpentResult = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .innerJoin('tx.voucher', 'voucher')
      .select('SUM(ABS(tx.amount)) / 100.0', 'sum') // Use ABS because spend is negative
      .where('voucher.ownerId = :userId', { userId })
      .andWhere('tx.sourceType = :type', { type: TransactionSourceType.SPEND })
      .getRawOne();

    const totalSpent = parseFloat(totalSpentResult?.sum || 0);

    return {
      activeVouchersCount,
      activeVoucherCouponsCount,
      totalCurrentBalance: currentRealBalance + currentRewardBalance,
      currentRealBalance,
      currentRewardBalance,
      totalBusinessRewardsReceived,
      totalSpent,
    };
  }

  // --- BUSINESS ANALYTICS ---

  async getBusinessStatsForUser(userId: string): Promise<any> {
    const business = await this.dataSource.manager.findOne(Business, {
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException('No business found for this user.');
    }

    return this.getBusinessStats(business.id);
  }

  async getBusinessStatsForShop(
    shopId: string,
    actor: User,
  ): Promise<any> {
    if (actor.role !== UserRole.ADMIN) {
      const business = await this.dataSource.manager.findOne(Business, {
        where: { user: { id: actor.id } },
        select: ['id'],
      });
      if (!business || business.id !== shopId) {
        throw new ForbiddenException(
          'You do not have permission to view this shop.',
        );
      }
    }
    return this.getBusinessStats(shopId);
  }

  async getBusinessStats(shopId: string): Promise<any> {
    // Prefer the typed `businessId` column; fall back to legacy rows that only
    // recorded the shop id in `contributorId`.
    const boundToShop = (qb: any) =>
      qb.andWhere(
        '(CAST(tx.businessId AS text) = :shopId OR (tx.businessId IS NULL AND tx.contributorId = :shopId))',
        { shopId },
      );

    const spent = await boundToShop(
      this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(ABS(tx.amount)) / 100.0', 'spent')
        .addSelect(
          'SUM(ABS(tx.realAmountDelta)) / 100.0',
          'realRedeemed',
        )
        .addSelect(
          'SUM(ABS(tx.rewardAmountDelta)) / 100.0',
          'rewardRedeemed',
        )
        .addSelect('COUNT(DISTINCT tx.voucherId)', 'customers')
        .where('tx.sourceType = :type', {
          type: TransactionSourceType.SPEND,
        }),
    ).getRawOne();

    const cashback = await boundToShop(
      this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('COUNT(*)', 'count')
        .addSelect(
          'SUM(ABS(tx.rewardAmountDelta)) / 100.0',
          'amount',
        )
        .where('tx.sourceType = :type', {
          type: TransactionSourceType.BUSINESS_CASHBACK,
        }),
    ).getRawOne();

    return {
      totalSpentInShop: parseFloat(spent?.spent || 0),
      customersCount: parseInt(spent?.customers || 0, 10),
      cashbackGivenCount: parseInt(cashback?.count || 0, 10),
      cashbackGivenAmount: parseFloat(cashback?.amount || 0),
      rewardRedeemedAmount: parseFloat(spent?.rewardRedeemed || 0),
      realRedeemedAmount: parseFloat(spent?.realRedeemed || 0),
      salesAttributed: parseFloat(spent?.spent || 0),
    };
  }

  async getAdminAnalytics(): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const activeVouchersCount = await this.dataSource.manager.count(
      UserVoucher,
      {
        where: { state: VoucherState.ACTIVE },
      },
    );

    const activeVouchersPrev = await this.dataSource.manager.count(
      UserVoucher,
      {
        where: {
          state: VoucherState.ACTIVE,
          created_at: LessThanOrEqual(thirtyDaysAgo) as any,
        },
      },
    );

    const getDepositSum = async (startDate: Date, endDate: Date) => {
      const result = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(tx.amount) / 100.0', 'sum')
        .where('tx.sourceType = :type', {
          type: TransactionSourceType.USER_DEPOSIT,
        })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();
      return parseFloat(result?.sum || 0);
    };

    const realMoneyCurrent = await getDepositSum(thirtyDaysAgo, now);
    const realMoneyPrev = await getDepositSum(sixtyDaysAgo, thirtyDaysAgo);

    const getRewardSum = async (startDate: Date, endDate: Date) => {
      const result = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(tx.rewardAmountDelta) / 100.0', 'sum')
        .where('tx.sourceType IN (:...types)', {
          types: [
            TransactionSourceType.SYSTEM_REWARD,
            TransactionSourceType.BUSINESS_CASHBACK,
          ],
        })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();
      return parseFloat(result?.sum || 0);
    };

    const rewardsCurrent = await getRewardSum(thirtyDaysAgo, now);
    const rewardsPrev = await getRewardSum(sixtyDaysAgo, thirtyDaysAgo);

    const getUtilizationMetrics = async (startDate: Date, endDate: Date) => {
      const spent = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(ABS(tx.amount)) / 100.0', 'sum')
        .where('tx.sourceType = :type', { type: TransactionSourceType.SPEND })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      const issued = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(tx.amount) / 100.0', 'sum')
        .where('tx.sourceType IN (:...types)', {
          types: [
            TransactionSourceType.USER_DEPOSIT,
            TransactionSourceType.SYSTEM_REWARD,
            TransactionSourceType.BUSINESS_CASHBACK,
          ],
        })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      const spentVal = parseFloat(spent?.sum || 0);
      const issuedVal = parseFloat(issued?.sum || 0);

      return issuedVal > 0 ? (spentVal / issuedVal) * 100 : 0;
    };

    const utilCurrent = await getUtilizationMetrics(thirtyDaysAgo, now);
    const utilPrev = await getUtilizationMetrics(sixtyDaysAgo, thirtyDaysAgo);

    const calculateChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - prev) / prev) * 100).toFixed(2));
    };

    return {
      activeVouchers: {
        value: activeVouchersCount,
        percentageChange: calculateChange(
          activeVouchersCount,
          activeVouchersPrev,
        ),
      },
      realMoneyInput: {
        value: realMoneyCurrent,
        percentageChange: calculateChange(realMoneyCurrent, realMoneyPrev),
      },
      rewardValueGiven: {
        value: rewardsCurrent,
        percentageChange: calculateChange(rewardsCurrent, rewardsPrev),
      },
      networkUtilization: {
        value: parseFloat(utilCurrent.toFixed(2)),
        percentageChange: calculateChange(utilCurrent, utilPrev),
      },
    };
  }

  private async validateScope(
    manager: EntityManager,
    definition: RewardDefinition,
    shopId: string,
    allowItemScope = false,
  ): Promise<void> {
    const scope = this.getScopeForDefinition(definition);
    if (!scope) return;

    if (scope.mode === ScopeMode.ITEMS) {
      if (allowItemScope) {
        // Cashback may be injected by an eligible shop even when the wallet is
        // item-scoped, as long as the shop is in the allow-list (if any).
        if (
          scope.listingIds.length > 0 &&
          !scope.listingIds.includes(shopId)
        ) {
          throw new BadRequestException(
            'Shop is not authorized for this voucher',
          );
        }
        return;
      }
      // POS cannot prove which item was bought, so item-scoped instruments
      // fail closed there and must go through online checkout/booking.
      throw new BadRequestException(
        'This voucher is restricted to specific items and can only be used at online checkout.',
      );
    }

    if (scope.mode === ScopeMode.LISTINGS) {
      let listingIds = scope.listingIds;
      if (listingIds.length === 0) {
        const validShops = await manager
          .createQueryBuilder()
          .relation(RewardDefinition, 'validShops')
          .of(definition)
          .loadMany();
        listingIds = validShops.map((shop) => shop.id);
      }

      if (!listingIds.includes(shopId)) {
        throw new BadRequestException(
          'Shop is not authorized for this voucher',
        );
      }
    }
  }
}

function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
