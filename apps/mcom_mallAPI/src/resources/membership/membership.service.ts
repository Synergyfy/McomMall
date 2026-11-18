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
import { randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { Membership } from './entities/membership.entity';
import { MembershipTier } from './membership-tier.enum';
import { McomWalletService } from '../payments/services/mcom-wallet.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
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
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly mcomCentralService: McomCentralService,
    private readonly plansService: PlansService,
    private readonly planExpiryService: PlanExpiryService,
    private readonly dataSource: DataSource,
  ) {}

  async findOne(user: User): Promise<any> {
    let centralUserId = user.centralUserId;
    if (!centralUserId) {
      const dbUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      centralUserId = dbUser?.centralUserId;
    }

    // 1. For SSO users, prioritize real-time MCOM Central entitlement
    if (centralUserId) {
      try {
        const userPackages =
          await this.mcomCentralService.getUserPackages(centralUserId);

        if (userPackages && userPackages.isActive) {
          const isTrial =
            userPackages.isTrial === true ||
            userPackages.accessType === 'TRIAL_PROGRAMME';
          const expiresAt =
            userPackages.plan?.expiresAt ||
            userPackages.entitlement?.trialContext?.trialExpiresAt ||
            null;

          let tierName = 'Central Membership';
          if (isTrial) {
            tierName = '14-Day Trial';
          } else if (userPackages.entitlement?.plan?.planName) {
            tierName = userPackages.entitlement.plan.planName;
          } else if (
            userPackages.entitlement?.membershipContext?.membershipPlanName
          ) {
            tierName = `${userPackages.entitlement.membershipContext.membershipPlanName} Membership`;
          }

          let displayTier: any = {
            id: userPackages.tierId || 'trial-tier',
            name: tierName,
            description: isTrial
              ? 'Task-gated trial access via MCOM Verification Programme'
              : null,
            monthlyPrice: null,
            quarterlyPrice: null,
            annualPrice: null,
            features: userPackages.entitlement?.plan?.features || [],
            configuration: userPackages.entitlement?.plan?.quotas || null,
            isActive: true,
          };

          if (!isTrial && userPackages.tierId) {
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
          }

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
            planType: userPackages.entitlement?.plan?.billingCycle || null,
            startDate: null,
            expiresAt,
            endDate: expiresAt,
            isTrial,
            trialDuration:
              userPackages.entitlement?.trialContext?.daysRemaining || 14,
            packages: userPackages.packages || [],
            accessType: userPackages.accessType,
            entitlement: userPackages.entitlement,
            programmeTasks:
              userPackages.programmeTasks ||
              userPackages.entitlement?.trialContext?.programmeTasks ||
              [],
          };
        }
      } catch (centralErr) {
        this.logger.warn(
          `Failed to fetch membership from central for user ${user.id}: ${centralErr}`,
        );
      }
    }

    // 2. Fallback: local active membership row (direct purchases)
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

    return null;
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

  async getRenewalState(userId: string) {
    const membership = await this.membershipRepository.findOne({
      where: { user: { id: userId } },
      relations: ['planVariant', 'planVariant.plan', 'planVariant.tierLevel'],
      order: { created_at: 'DESC' },
    });
    if (!membership) return null;
    return {
      membershipId: membership.id,
      autoRenew: membership.autoRenew,
      renewalStatus: membership.renewalStatus,
      nextChargeAt: membership.nextChargeAt,
      renewalAttempts: membership.renewalAttempts,
      lastRenewalAt: membership.lastRenewalAt,
      renewalAmount: membership.renewalAmount,
      renewalCurrency: membership.renewalCurrency,
      renewalMethod: membership.renewalMethod,
      currentPeriodEnd: membership.expiresAt,
      planName: membership.planVariant?.plan?.name ?? null,
    };
  }

  async updateRenewal(userId: string, autoRenew: boolean) {
    const membership = await this.membershipRepository.findOne({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }

    if (autoRenew) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user?.centralUserId) {
        throw new BadRequestException(
          'Link your MCOM Wallet via SSO before enabling auto-renewal.',
        );
      }
      membership.autoRenew = true;
      membership.renewalStatus = 'active';
      membership.renewalAttempts = 0;
      membership.nextChargeAt =
        membership.expiresAt && membership.expiresAt > new Date()
          ? membership.expiresAt
          : new Date();
    } else {
      membership.autoRenew = false;
      membership.renewalStatus = 'canceled';
      membership.nextChargeAt = null;
    }
    await this.membershipRepository.save(membership);
    return this.getRenewalState(userId);
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
    transactionId?: string;
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
      // MCOM Pay wallet charges settle immediately (no hold/capture round trip).
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
      // Pre-authorise, don't debit. The hold is captured only when the
      // membership can actually be granted; abandoned attempts expire safely.
      const hold = await this.paymentProviderService.createWalletHold({
        mcomUserId: centralUserId,
        amount: Number(price),
        reference: `membership-${scope}-${user.id}`,
        idempotencyKey: this.mcomWalletService.buildKey(
          'membership-hold',
          scope,
          user.id,
          Number(price).toFixed(2),
          initiateDto.idempotencyKey || randomUUID(),
        ),
        metadata: {
          purpose: 'MEMBERSHIP',
          userId: user.id,
          planVariantId: initiateDto.planVariantId,
          tierId: initiateDto.tierId,
          planType,
        },
      });
      return {
        transactionId: hold.holdId,
        holdId: hold.holdId,
        expiresAt: hold.expiresAt,
        provider: PaymentMethod.MCOM_WALLET,
      };
    }

    const scope =
      initiateDto.planVariantId ||
      initiateDto.tierId ||
      initiateDto.tier ||
      'membership';

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      // Card money moves through MCOM Pay (Central owns the Stripe account).
      const intent =
        await this.paymentProviderService.createStripePaymentIntent(
          Number(price),
          'GBP',
          {
            reference: `membership-${scope}-${user.id}`,
            userId: user.id,
            idempotencyKey:
              initiateDto.idempotencyKey ||
              `membership-${scope}-${user.id}-${Number(price).toFixed(2)}`,
            description: 'MCOM Mall membership',
          },
        );
      return {
        clientSecret: intent.client_secret ?? undefined,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentProvider === PaymentMethod.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        Number(price),
        'GBP',
        {
          reference: `membership-${scope}-${user.id}`,
          userId: user.id,
          idempotencyKey:
            initiateDto.idempotencyKey ||
            `membership-${scope}-${user.id}-${Number(price).toFixed(2)}`,
          description: 'MCOM Mall membership',
          returnUrl:
            initiateDto.returnUrl ||
            `${(process.env.MALL_FRONTEND_URL || process.env.FRONTEND_URL || '').replace(/\/$/, '')}/pricing?paypal=return`,
          cancelUrl:
            initiateDto.cancelUrl ||
            `${(process.env.MALL_FRONTEND_URL || process.env.FRONTEND_URL || '').replace(/\/$/, '')}/pricing`,
        },
      );
      return {
        orderId: order.id,
        approvalUrl: order.approvalUrl ?? undefined,
        provider: PaymentMethod.PAYPAL,
      };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
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

    let centralUserId = user.centralUserId;
    if (!centralUserId) {
      const dbUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      centralUserId = dbUser?.centralUserId;
    }

    let verificationResult: {
      ok: boolean;
      details?: any;
      reason?: string;
    };
    let mcomChargeId: string | null = null;
    let providerRef: string | null = null;
    let feeMinor: string | null = null;
    let netMinor: string | null = null;

    if (paymentProvider === PaymentMethod.MCOM_WALLET) {
      const walletReference = transactionId || holdId;
      if (!walletReference) {
        throw new BadRequestException(
          'A wallet payment reference is required for MCOM Wallet membership payments.',
        );
      }
      if (!centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      verificationResult =
        await this.paymentProviderService.settleWalletReference(
          walletReference,
          Number(Number(price).toFixed(2)),
          'GBP',
          {
            mallUserId: user.id,
            mcomUserId: centralUserId,
            holdId,
            reference: `membership-${targetVariantId || tierEnum || 'membership'}-${user.id}`,
          },
          this.mcomWalletService.buildKey('sub-capture', walletReference),
        );
      if (verificationResult.ok) {
        const details = verificationResult.details ?? {};
        transactionId =
          details.transactionId || details.id || walletReference;
        const detailId = String(details.id || '');
        mcomChargeId =
          detailId && !detailId.startsWith('wallet:') ? detailId : null;
        providerRef = details.providerRef ?? null;
        feeMinor = details.feeMinor ?? null;
        netMinor = details.netMinor ?? null;
        currency = 'GBP';
      }
    } else if (paymentProvider === PaymentMethod.STRIPE) {
      if (!transactionId) {
        throw new BadRequestException(
          'A Stripe payment reference is required.',
        );
      }
      verificationResult =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          Number(Number(price).toFixed(2)),
          'GBP',
          {
            mallUserId: user.id,
            mcomUserId: centralUserId,
          },
        );
      const details: any = verificationResult.details ?? {};
      mcomChargeId = details.id ?? null;
      providerRef = details.providerRef ?? null;
      feeMinor = details.feeMinor ?? null;
      netMinor = details.netMinor ?? null;
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      if (!transactionId) {
        throw new BadRequestException('A PayPal order ID is required.');
      }
      verificationResult =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          transactionId,
          Number(Number(price).toFixed(2)),
          'GBP',
          {
            mallUserId: user.id,
            mcomUserId: centralUserId,
          },
        );
      const details: any = verificationResult.details ?? {};
      mcomChargeId = details.id ?? null;
      providerRef = details.providerRef ?? null;
      feeMinor = details.feeMinor ?? null;
      netMinor = details.netMinor ?? null;
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }

    if (!verificationResult.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verificationResult.reason}`,
      );
    }
    if (!transactionId) {
      throw new BadRequestException(
        'A payment reference could not be resolved.',
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
            mcomChargeId,
            providerRef,
            feeMinor,
            netMinor,
            status: 'paid',
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
      membership.user = { id: user.id } as User;
      membership.startDate = startDate;
      membership.expiresAt = expiresAt;
      membership.endDate = expiresAt;
      membership.isActive = true;
      membership.isTrial = false;
      membership.planType = planType;
      membership.payment = savedPayment;
      // Recurring: debit the central MCOM Wallet at each expiry. If the user
      // has no linked central wallet there is no mandate, so auto-renew is off.
      membership.autoRenew = Boolean(centralUserId);
      membership.renewalStatus = centralUserId ? 'active' : 'canceled';
      membership.nextChargeAt = centralUserId ? expiresAt : null;
      membership.renewalAttempts = 0;
      membership.renewalAmount = Number(price);
      membership.renewalCurrency = 'GBP';
      membership.renewalMethod = 'mcom_wallet';

      const savedMembership = await membershipRepo.save(membership);

      // One charge may fund one membership only. Wallet captures are keyed by
      // their wallet transaction id so they get the same replay protection.
      await this.paymentProviderService.allocateCharge(
        {
          mcomChargeId: mcomChargeId || `wallet:${transactionId}`,
          purpose: 'MEMBERSHIP',
          entityType: 'membership',
          entityId: savedMembership.id,
          userId: user.id,
          amountMinor: String(Math.round(Number(price) * 100)),
          currency: 'GBP',
        },
        manager,
      );

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
      membership.user = { id: user.id } as User;
      membership.startDate = startDate;
      membership.expiresAt = expiresAt;
      membership.endDate = expiresAt;
      membership.isActive = true;
      membership.isTrial = true;
      membership.trialDuration = trialDurationDays;
      membership.planType = PlanType.MONTHLY; // Default to monthly after trial usually

      const savedMembership = await membershipRepo.save(membership);

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
      membership.user = { id: user.id } as User;
      membership.startDate = startDate;
      membership.expiresAt = expiresAt;
      membership.endDate = expiresAt;
      membership.isActive = true;
      membership.isTrial = false;
      membership.planType = PlanType.MONTHLY; // Default

      const savedMembership = await membershipRepo.save(membership);

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
