import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Membership } from './entities/membership.entity';
import { MembershipTier } from './membership-tier.enum';
import { McomWalletService } from '../payments/services/mcom-wallet.service';
import {
  SolutionsBillingCycle,
  SolutionsPaymentProxyService,
} from '../payments/services/solutions-payment-proxy.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import {
  InitiateMembershipPaymentDto,
  PlanType,
} from './dto/initiate-membership-payment.dto';
import { VerifyMembershipPaymentDto } from './dto/verify-membership-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { MembershipPayment } from './entities/membership-payment.entity';
import { McomCentralService } from '../sso/mcom-central.service';
import {
  MembershipCredit,
  MembershipCreditStatus,
} from './entities/membership-credit.entity';
import {
  CreateMembershipCreditDto,
  UpdateMembershipCreditStatusDto,
} from './dto/membership-credit.dto';
import { PlansService } from '../plans/services/plans.service';
import { PlanExpiryService } from '../plans/services/plan-expiry.service';
import { PlanTier } from '../plans/enums/plan-tier.enum';
import { PlanVariant } from '../plans/entities/plan-variant.entity';

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  private readonly membershipPrices: Map<MembershipTier, number> = new Map([
    [MembershipTier.BASIC, 10],
    [MembershipTier.EXTENDED, 50],
    [MembershipTier.PROFESSIONAL, 100],
  ]);

  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MembershipPayment)
    private readonly paymentRepository: Repository<MembershipPayment>,
    @InjectRepository(MembershipCredit)
    private readonly creditRepository: Repository<MembershipCredit>,
    @Inject(forwardRef(() => McomWalletService))
    private readonly mcomWalletService: McomWalletService,
    private readonly solutionsPaymentProxy: SolutionsPaymentProxyService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly mcomCentralService: McomCentralService,
    private readonly plansService: PlansService,
    private readonly planExpiryService: PlanExpiryService,
    private readonly dataSource: DataSource,
  ) {}

  async findOne(user: User): Promise<any> {
    // Source of truth: the local membership row. It only ever exists after a
    // verified payment (central wallet capture), admin grant, or trial.
    // Money itself always moves on the MCOM Solutions wallet server — the DB
    // decides entitlement, never funds.
    try {
      const local = await this.findActiveWithTier(user.id);
      if (
        local?.isActive &&
        local.expiresAt &&
        new Date(local.expiresAt).getTime() > Date.now()
      ) {
        return await this.toLocalMembershipDto(local);
      }
    } catch {
      // Never let a local read break the central fallback path below.
    }

    let centralUserId = user.centralUserId;
    if (!centralUserId) {
      const dbUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      centralUserId = dbUser?.centralUserId;
    }

    if (!centralUserId) {
      throw new BadRequestException(
        'MCOM Solutions user ID not found. Please re-authenticate via SSO.',
      );
    }

    const userPackages =
      await this.mcomCentralService.getUserPackages(centralUserId);

    if (!userPackages) {
      return null;
    }

    if (!userPackages.isActive || !userPackages.tierId) {
      return null;
    }

    let displayTier: any = {
      id: userPackages.tierId,
      name: 'Central Membership',
      description: null,
      monthlyPrice: null,
      quarterlyPrice: null,
      annualPrice: null,
      features: [],
      configuration: null,
      isActive: true,
    };

    try {
      const { variant } = await this.plansService.resolveActivePrice(
        userPackages.tierId,
      );
      const level = variant.tierLevel?.name;
      const label =
        level === PlanTier.PRO_PLUS
          ? 'Pro+'
          : level === PlanTier.PRO
            ? 'Pro'
            : 'Standard';
      displayTier = {
        id: variant.id,
        name: `${variant.plan?.name ?? 'Plan'} · ${label}`,
        description: variant.plan?.description ?? null,
        monthlyPrice: null,
        quarterlyPrice: null,
        annualPrice: null,
        features: variant.features ?? [],
        configuration: variant.configuration ?? null,
        isActive: true,
      };
    } catch {
      // Fallback display tier retained
    }

    // Attach the local variant purchase snapshot when present so storefronts
    // can display plan + tier names (resolved via public GET /plans).
    // Never allowed to break the central-SSO read path.
    let planVariantId: string | null = null;
    let priceId: string | null = null;
    try {
      const localMembership = await this.findActiveWithTier(user.id);
      planVariantId = localMembership?.planVariantId ?? null;
      priceId = localMembership?.priceId ?? null;
    } catch {
      planVariantId = null;
      priceId = null;
    }

    return {
      id: `subscription-${user.id}`,
      isActive: true,
      tierId: displayTier.id,
      tier: displayTier,
      planVariantId,
      priceId,
      planType: null,
      startDate: null,
      expiresAt: null,
      endDate: null,
      isTrial: false,
      trialDuration: 0,
      packages: userPackages.packages,
    };
  }

  /**
   * Maps a local membership row to the same shape as the central-SSO
   * response so every consumer (badge, membership page, billing) works
   * unchanged regardless of where the subscription originated.
   */
  private async toLocalMembershipDto(membership: Membership): Promise<any> {
    let tier: any = null;
    if (membership.planVariantId) {
      try {
        const { variant } = await this.plansService.resolveActivePrice(
          membership.planVariantId,
        );
        const level = variant.tierLevel?.name;
        const label =
          level === PlanTier.PRO_PLUS
            ? 'Pro+'
            : level === PlanTier.PRO
              ? 'Pro'
              : 'Standard';
        tier = {
          id: variant.id,
          name: `${variant.plan?.name ?? 'Plan'} · ${label}`,
          description: variant.plan?.description ?? null,
          monthlyPrice: null,
          quarterlyPrice: null,
          annualPrice: null,
          features: variant.features ?? [],
          configuration: variant.configuration ?? null,
          isActive: true,
        };
      } catch {
        tier = { id: membership.planVariantId, name: 'Membership' };
      }
    } else {
      tier = { id: null, name: 'Membership' };
    }

    return {
      id: membership.id,
      isActive: true,
      tierId: membership.planVariantId ?? null,
      tier,
      planVariantId: membership.planVariantId ?? null,
      priceId: membership.priceId ?? null,
      planType: membership.planType ?? null,
      startDate: membership.startDate ?? null,
      expiresAt: membership.expiresAt ?? null,
      endDate: membership.endDate ?? membership.expiresAt ?? null,
      isTrial: membership.isTrial ?? false,
      trialDuration: membership.trialDuration ?? 0,
      packages: [],
    };
  }

  private async ensureDates(membership: Membership): Promise<void> {
    let changed = false;
    if (!membership.startDate) {
      membership.startDate = membership.created_at || new Date();
      changed = true;
    }
    if (!membership.endDate) {
      membership.endDate = membership.expiresAt;
      changed = true;
    }

    if (changed) {
      await this.membershipRepository.save(membership);
    }
  }

  async findActiveWithTier(userId: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['planVariant', 'planVariant.tierLevel', 'planVariant.plan'],
    });

    if (membership) {
      await this.ensureDates(membership);
    }

    return membership;
  }

  getMembershipPrice(tier: MembershipTier): number {
    const price = this.membershipPrices.get(tier);
    if (price === undefined) {
      throw new NotFoundException(`Membership tier "${tier}" not found.`);
    }
    return price;
  }

  async initiateMembershipPayment(
    initiateDto: InitiateMembershipPaymentDto,
    user: User,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string;
    holdId?: string;
    expiresAt?: string;
    provider: PaymentMethod;
  }> {
    // Repurchase is allowed: paying for another (or the same) plan replaces
    // the active membership once the new payment verifies. No conflict here —
    // unverified initiates (Stripe intents, PayPal orders, wallet holds)
    // simply expire on the provider side.

    let price = 0;

    const variantId = initiateDto.planVariantId || initiateDto.tierId;
    if (variantId) {
      const { price: activePrice } = await this.plansService.resolveActivePrice(
        variantId,
      );
      price = Number(activePrice.amount);
    } else if (initiateDto.tier) {
      // Legacy Enum Support
      price = this.getMembershipPrice(initiateDto.tier);
    }

    if (initiateDto.paymentProvider === PaymentMethod.MCOM_WALLET) {
      // Centralized wallet path: reserve funds now, capture on verify.
      if (!this.mcomWalletService.isEnabled()) {
        throw new BadRequestException(
          'MCOM Wallet payments are currently disabled.',
        );
      }
      let centralUserId = user.centralUserId;
      if (!centralUserId) {
        const dbUser = await this.userRepository.findOne({
          where: { id: user.id },
        });
        centralUserId = dbUser?.centralUserId;
      }
      if (!centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      const scope =
        initiateDto.planVariantId ||
        initiateDto.tierId ||
        initiateDto.tier ||
        'membership';
      const planType = initiateDto.planType || PlanType.MONTHLY;
      try {
        const hold = await this.mcomWalletService.placeHold({
          userId: centralUserId,
          amount: Number(Number(price).toFixed(2)),
          reference: `mall-membership-${user.id}`,
          metadata: {
            platform: 'mcom-mall',
            mallUserId: user.id,
            planVariantId: initiateDto.planVariantId,
            tierId: initiateDto.tierId,
            planType,
          },
          idempotencyKey:
            initiateDto.idempotencyKey ||
            this.mcomWalletService.buildKey(
              'sub-hold',
              user.id,
              String(scope),
              planType,
            ),
        });
        return {
          holdId: hold.holdId,
          expiresAt: hold.expiresAt,
          provider: PaymentMethod.MCOM_WALLET,
        };
      } catch (err: any) {
        throw this.mcomWalletService.toHttpException(err);
      }
    }

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      // Card money moves on MCOM Solutions (their Stripe account): the mall
      // forwards the plan reference, Solutions prices it from /system/plans
      // and returns a clientSecret the browser confirms with Solutions' key.
      const { externalPlanId, billingCycle } =
        await this.resolveSolutionsPlan(initiateDto);
      const initiated = await this.solutionsPaymentProxy.stripeInitiate(
        user.id,
        externalPlanId,
        billingCycle,
      );
      return {
        clientSecret: initiated.clientSecret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentProvider === PaymentMethod.PAYPAL) {
      // Same centralized routing for PayPal: Solutions creates the order
      // (their PayPal account) and the browser approves on paypal.com.
      const { externalPlanId, billingCycle } =
        await this.resolveSolutionsPlan(initiateDto);
      const initiated = await this.solutionsPaymentProxy.paypalInitiate(
        user.id,
        externalPlanId,
        billingCycle,
        initiateDto.returnUrl,
        initiateDto.cancelUrl,
      );
      return {
        orderId: initiated.orderId,
        approvalUrl: initiated.approvalUrl,
        provider: PaymentMethod.PAYPAL,
      };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  /**
   * Resolves the plan reference MCOM Solutions needs to price a centralized
   * card/PayPal payment. Solutions' connector reads the plan back from
   * GET /system/plans/:id (legacy tiers + synthesized plan variants).
   * Legacy tier-enum purchases carry no plan id, so they cannot be priced
   * centrally — callers must pick a real plan.
   */
  private async resolveSolutionsPlan(planRef: {
    planVariantId?: string;
    tierId?: string;
    planType?: PlanType;
  }): Promise<{
    externalPlanId: string;
    billingCycle: SolutionsBillingCycle;
  }> {
    const variantId = planRef.planVariantId || planRef.tierId;
    if (variantId) {
      const { variant } = await this.plansService.resolveActivePrice(variantId);
      const level = variant.tierLevel?.name;
      // Variants are one-off purchases; map to the closest named cycle for
      // Solutions' ledger (the charged amount is identical either way).
      const billingCycle: SolutionsBillingCycle =
        level === PlanTier.PRO_PLUS ? 'annual' : 'quarterly';
      return { externalPlanId: variantId, billingCycle };
    }
    throw new BadRequestException(
      'Card and PayPal payments require a valid plan variant id.',
    );
  }

  async verifyAndCreateMembership(
    verifyDto: VerifyMembershipPaymentDto,
    user: User,
  ): Promise<Membership> {
    const { paymentProvider, purchaseDetails } = verifyDto;
    let transactionId = verifyDto.transactionId;
    const holdId = verifyDto.holdId || transactionId;
    const {
      tier: tierEnum,
      tierId,
      planVariantId,
      planType = PlanType.MONTHLY,
    } = purchaseDetails;

    let price = 0;
    let purchasedVariant: PlanVariant | null = null;
    let priceSnapshotId: string | null = null;
    let currency = 'GBP';

    const targetVariantId = planVariantId || tierId;
    if (targetVariantId) {
      const resolved =
        await this.plansService.resolveActivePrice(targetVariantId);
      purchasedVariant = resolved.variant;
      priceSnapshotId = resolved.price.id;
      price = Number(resolved.price.amount);
    } else if (tierEnum) {
      price = this.getMembershipPrice(tierEnum);
    }

    let verificationResult;

    if (paymentProvider === PaymentMethod.MCOM_WALLET) {
      // Centralized wallet path: convert the pre-authorization hold from
      // initiate-payment into a real SUBSCRIPTION debit. Uncaptured holds
      // auto-expire (~24h) as a backstop.
      if (!holdId) {
        throw new BadRequestException(
          'A wallet hold ID is required for MCOM Wallet membership payments.',
        );
      }
      let centralUserId = user.centralUserId;
      if (!centralUserId) {
        const dbUser = await this.userRepository.findOne({
          where: { id: user.id },
        });
        centralUserId = dbUser?.centralUserId;
      }
      if (!centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      try {
        const captured = await this.mcomWalletService.captureHold({
          holdId,
          amount: Number(Number(price).toFixed(2)),
          reference: `mall-membership-${user.id}`,
          // Scoped per hold (not per plan): retries of the same purchase
          // replay safely, while a new purchase can never collide with a
          // previous capture's key on the central ledger.
          idempotencyKey: this.mcomWalletService.buildKey(
            'sub-capture',
            holdId,
          ),
        });
        transactionId = captured.transactionId;
        currency = 'MCOM';
        verificationResult = { ok: true as boolean, details: captured };
      } catch (err: any) {
        throw this.mcomWalletService.toHttpException(err);
      }
    } else if (paymentProvider === PaymentMethod.STRIPE) {
      // Centralized card path: Solutions created the PaymentIntent (their
      // Stripe account) and already verified it succeeded server-side in
      // confirm — including amount vs the same plan price. Trust success.
      if (!transactionId) {
        throw new BadRequestException(
          'A Stripe payment reference is required.',
        );
      }
      const { externalPlanId, billingCycle } = await this.resolveSolutionsPlan({
        planVariantId,
        tierId,
        planType,
      });
      const confirmed = await this.solutionsPaymentProxy.stripeConfirm(
        user.id,
        externalPlanId,
        billingCycle,
        transactionId,
      );
      verificationResult = { ok: confirmed.ok, details: confirmed.details };
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      // Centralized PayPal path: Solutions captures the order (their PayPal
      // account) and validates amount/currency against the plan price.
      if (!transactionId) {
        throw new BadRequestException('A PayPal order ID is required.');
      }
      const confirmed =
        await this.solutionsPaymentProxy.paypalCapture(transactionId);
      verificationResult = { ok: confirmed.ok, details: confirmed.details };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }

    if (!verificationResult.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verificationResult.reason}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(MembershipPayment);
      const membershipRepo = manager.getRepository(Membership);
      const userRepo = manager.getRepository(User);

      // Idempotency check: if transactionId already processed, return existing membership
      const existingPayment = await paymentRepo.findOne({
        where: { transactionId },
        relations: ['membership'],
      });
      if (existingPayment?.membership) {
        return existingPayment.membership;
      }
      // A previous attempt may have saved the payment row but failed before
      // the membership row (transactionId is unique) — reuse it instead of
      // inserting a duplicate.
      const savedPayment =
        existingPayment ??
        (await paymentRepo.save(
          paymentRepo.create({
            user,
            amount: price,
            currency,
            paymentMethod: paymentProvider,
            transactionId,
          }),
        ));

      let startDate = new Date();
      let expiresAt = new Date();

      if (purchasedVariant) {
        const level = purchasedVariant.tierLevel?.name;
        if (level === PlanTier.PRO_PLUS) {
          expiresAt = this.planExpiryService.proPlusExpiry(startDate);
        } else if (level === PlanTier.PRO) {
          expiresAt = this.planExpiryService.proExpiry(startDate);
        } else {
          expiresAt = this.planExpiryService.standardExpiry(startDate);
        }
      } else {
        // Add 1 month or 1 year
        if (planType === PlanType.ANNUAL) {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
      }

      // Replace semantics: memberships.userId is a one-to-one (unique), so a
      // user can only ever have ONE membership row. A new purchase updates the
      // existing row in place (or inserts when none exists) — inserting a
      // second row violates REL_187d573e43b2c2aa3960df20b7.
      // trialDuration is intentionally left untouched so joinTrial's
      // one-trial-ever check keeps working after a trial->paid upgrade.
      const prior = await membershipRepo.findOne({
        where: { user: { id: user.id } },
        order: { created_at: 'DESC' },
      });

      const membership = prior ?? membershipRepo.create();
      membership.planVariant = purchasedVariant ?? undefined;
      membership.planVariantId = purchasedVariant ? purchasedVariant.id : null;
      membership.priceId = priceSnapshotId;
      membership.user = user;
      membership.startDate = startDate;
      membership.expiresAt = expiresAt;
      membership.endDate = expiresAt;
      membership.isActive = true;
      membership.isTrial = false;
      membership.planType = planType;
      membership.payment = savedPayment;

      const savedMembership = await membershipRepo.save(membership);

      user.membership = savedMembership;
      await userRepo.save(user);

      // Process Cashback
      if (user.email) {
        try {
          await this.centralIntegrationService.processCashback(
            user.email,
            Number(price),
            CashbackEvent.MALL_MEMBERSHIP_PAYMENT,
            transactionId,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process cashback for membership ${transactionId}: ${error.message}`,
          );
        }
      }

      return savedMembership;
    });
  }
  // ... (omitting unchanged methods) ...

  async joinTrial(tierId: string, user: User): Promise<Membership> {
    const existingMembership = await this.membershipRepository.findOne({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' }, // Check mostly recent
    });

    // Simple check: if they ever had a membership (trial or paid), deny?
    // Or checking specifically for isTrial usage if we had history.
    // For now, if they have an *active* membership, deny.
    if (existingMembership && existingMembership.isActive) {
      throw new ConflictException('User already has an active membership.');
    }

    // Strict "one trial per user ever": the single membership row is updated
    // in place on purchase, so a trial->paid user keeps trialDuration as the
    // marker (isTrial itself is cleared on paid purchase).
    const trialUsage = await this.membershipRepository.findOne({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' },
    });
    if (
      trialUsage &&
      (trialUsage.isTrial || (trialUsage.trialDuration ?? 0) > 0)
    ) {
      throw new ForbiddenException('User has already used their trial period.');
    }

    let purchasedVariant: PlanVariant | null = null;
    let trialDurationDays = 14;

    try {
      const resolved = await this.plansService.resolveActivePrice(tierId);
      purchasedVariant = resolved.variant;
      trialDurationDays = purchasedVariant.tierLevel?.durationDays || 14;
    } catch {
      throw new NotFoundException('Plan variant not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const membershipRepo = manager.getRepository(Membership);
      const userRepo = manager.getRepository(User);

      let startDate = new Date();
      let expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + trialDurationDays);

      const priorTrial = await membershipRepo.findOne({
        where: { user: { id: user.id } },
        order: { created_at: 'DESC' },
      });
      // Single membership row per user (one-to-one): update in place so a
      // trial after an expired paid plan doesn't violate the unique user FK.
      const membership = priorTrial ?? membershipRepo.create();
      membership.planVariant = purchasedVariant;
      membership.planVariantId = purchasedVariant.id;
      membership.user = user;
      membership.startDate = startDate;
      membership.expiresAt = expiresAt;
      membership.endDate = expiresAt;
      membership.isActive = true;
      membership.isTrial = true;
      membership.trialDuration = trialDurationDays;
      membership.planType = PlanType.MONTHLY; // Default to monthly after trial usually

      const savedMembership = await membershipRepo.save(membership);
      user.membership = savedMembership;
      await userRepo.save(user);

      return savedMembership;
    });
  }

  async grantAccess(
    user: User,
    planVariantId: string,
    durationDays: number,
  ): Promise<Membership> {
    let variant: PlanVariant;
    try {
      const resolved = await this.plansService.resolveActivePrice(planVariantId);
      variant = resolved.variant;
    } catch {
      throw new NotFoundException('Plan variant not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const membershipRepo = manager.getRepository(Membership);
      const userRepo = manager.getRepository(User);

      let startDate = new Date();
      let expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const priorGrant = await membershipRepo.findOne({
        where: { user: { id: user.id } },
        order: { created_at: 'DESC' },
      });
      const membership = priorGrant ?? membershipRepo.create();
      membership.planVariant = variant;
      membership.planVariantId = variant.id;
      membership.user = user;
      membership.startDate = startDate;
      membership.expiresAt = expiresAt;
      membership.endDate = expiresAt;
      membership.isActive = true;
      membership.isTrial = false;
      membership.planType = PlanType.MONTHLY; // Default

      const savedMembership = await membershipRepo.save(membership);
      user.membership = savedMembership;
      await userRepo.save(user);

      return savedMembership;
    });
  }

  async getCredits(user: User): Promise<MembershipCredit[]> {
    return this.creditRepository.find({
      where: { userId: user.id },
      order: { created_at: 'DESC' },
    });
  }

  async createCredit(
    user: User,
    dto: CreateMembershipCreditDto,
  ): Promise<MembershipCredit> {
    const credit = this.creditRepository.create({
      userId: user.id,
      type: dto.type,
      amount: dto.amount,
      title: dto.title,
      businessId: dto.businessId,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      note: dto.note,
      status: MembershipCreditStatus.AVAILABLE,
    });
    return this.creditRepository.save(credit);
  }

  async updateCreditStatus(
    user: User,
    creditId: string,
    dto: UpdateMembershipCreditStatusDto,
  ): Promise<MembershipCredit> {
    const credit = await this.creditRepository.findOne({
      where: { id: creditId, userId: user.id },
    });
    if (!credit) {
      throw new NotFoundException(
        `Membership credit with ID "${creditId}" not found`,
      );
    }

    credit.status = dto.status;
    credit.note = dto.note ?? credit.note;
    if (dto.status === MembershipCreditStatus.REDEEMED) {
      credit.redeemedAt = new Date();
    }
    return this.creditRepository.save(credit);
  }
}
