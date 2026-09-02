import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Membership } from './entities/membership.entity';
import { MembershipTier } from './membership-tier.enum';
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
import { Tier } from '../tier/entities/tier.entity';
import { TierType } from '../tier/enums/tier-type.enum';
import { McomCentralService } from '../sso/mcom-central.service';

@Injectable()
export class MembershipService {
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
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly mcomCentralService: McomCentralService,
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

    if (!centralUserId) {
      throw new BadRequestException(
        'MCOM Solutions user ID not found. Please re-authenticate via SSO.',
      );
    }

    const userPackages = await this.mcomCentralService.getUserPackages(
      centralUserId,
    );

    if (!userPackages) {
      return null;
    }

    if (!userPackages.isActive || !userPackages.tierId) {
      return null;
    }

    const tier = await this.tierRepository.findOne({
      where: { id: userPackages.tierId },
    });

    if (!tier) {
      return null;
    }

    return {
      id: `subscription-${user.id}`,
      isActive: true,
      tierId: tier.id,
      tier: {
        id: tier.id,
        name: tier.name,
        description: tier.description,
        monthlyPrice: tier.monthlyPrice,
        quarterlyPrice: tier.quarterlyPrice,
        annualPrice: tier.annualPrice,
        features: tier.features,
        configuration: tier.configuration,
        isActive: tier.isActive,
      },
      planType: null,
      startDate: null,
      expiresAt: null,
      endDate: null,
      isTrial: false,
      trialDuration: 0,
      packages: userPackages.packages,
    };
  }

  private async ensureDates(membership: Membership): Promise<void> {
    let changed = false;
    if (!membership.startDate) {
      membership.startDate = membership.created_at || new Date();
      changed = true;
    }
    if (!membership.endDate) {
      if (
        membership.tier?.type === TierType.SEASONAL &&
        membership.tier.season
      ) {
        membership.endDate = membership.tier.season.endDate;
      } else {
        membership.endDate = membership.expiresAt;
      }
      changed = true;
    }

    if (changed) {
      await this.membershipRepository.save(membership);
    }
  }

  async findActiveWithTier(userId: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['tier', 'tier.season'],
    });

    if (membership && !membership.tier && membership.tierType) {
      console.log(
        `[MembershipService] Self-healing initiated for user ${userId} with tierType ${membership.tierType}`,
      );

      const legacyTierMap: Record<string, string> = {
        basic: 'Basic',
        extended: 'Extended',
        professional: 'Professional',
      };

      const targetName =
        legacyTierMap[membership.tierType] || membership.tierType;

      const tier = await this.tierRepository.findOne({
        where: { name: targetName },
      });

      if (tier) {
        console.log(
          `[MembershipService] Found matching tier: ${tier.name} (${tier.id})`,
        );
        membership.tier = tier;
        membership.tierId = tier.id;
        await this.ensureDates(membership);
        await this.membershipRepository.save(membership);
        console.log(`[MembershipService] Membership updated with tier link.`);
      } else {
        console.warn(
          `[MembershipService] Could not find tier with name: ${targetName}`,
        );
      }
    }

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
    provider: PaymentMethod;
  }> {
    const existingMembership = await this.membershipRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
    });

    if (existingMembership) {
      // Allow upgrade if needed, but for now strict conflict
      throw new ConflictException('User already has an active membership.');
    }

    let price = 0;
    const currency = 'GBP';

    if (initiateDto.tierId) {
      const tier = await this.tierRepository.findOne({
        where: { id: initiateDto.tierId },
      });
      if (!tier) throw new NotFoundException('Tier not found');

      const planType = initiateDto.planType || PlanType.MONTHLY;
      if (planType === PlanType.ANNUAL) {
        price = tier.annualPrice;
      } else if (planType === PlanType.QUARTERLY) {
        price = tier.quarterlyPrice;
      } else {
        price = tier.monthlyPrice;
      }
    } else {
      // Legacy Enum Support
      price = this.getMembershipPrice(initiateDto.tier);
    }

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          price,
          currency,
        );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentProvider === PaymentMethod.PAYPAL) {
      // If we had a planId logic for PayPal Subscriptions, we would use createSubscription here.
      // But adhering to current createOrder logic for one-time payments (or initial payment):
      const order = await this.paymentProviderService.createPaypalOrder(
        price,
        currency,
      );
      return { orderId: order.id, provider: PaymentMethod.PAYPAL };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyAndCreateMembership(
    verifyDto: VerifyMembershipPaymentDto,
    user: User,
  ): Promise<Membership> {
    const { paymentProvider, transactionId, purchaseDetails } = verifyDto;
    const {
      tier: tierEnum,
      tierId,
      planType = PlanType.MONTHLY,
    } = purchaseDetails;

    const existingMembership = await this.membershipRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
    });

    if (existingMembership) {
      throw new ConflictException('User already has an active membership.');
    }

    let price = 0;
    let tierEntity: Tier | null = null;
    const currency = 'GBP';

    if (tierId) {
      tierEntity = await this.tierRepository.findOne({
        where: { id: tierId },
        relations: ['season'],
      });
      if (!tierEntity) throw new NotFoundException('Tier not found');

      if (planType === PlanType.ANNUAL) {
        price = tierEntity.annualPrice;
      } else if (planType === PlanType.QUARTERLY) {
        price = tierEntity.quarterlyPrice;
      } else {
        price = tierEntity.monthlyPrice;
      }
    } else {
      price = this.getMembershipPrice(tierEnum);
    }

    let verificationResult;

    if (paymentProvider === PaymentMethod.STRIPE) {
      verificationResult =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          price,
          currency,
        );
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      verificationResult =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          transactionId,
          price,
          currency,
        );
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

      const newPayment = paymentRepo.create({
        user,
        amount: price,
        currency,
        paymentMethod: paymentProvider,
        transactionId,
      });
      const savedPayment = await paymentRepo.save(newPayment);

      let startDate = new Date();
      let expiresAt = new Date();

      if (tierEntity?.type === TierType.SEASONAL && tierEntity.season) {
        startDate = new Date(tierEntity.season.startDate);
        expiresAt = new Date(tierEntity.season.endDate);
      } else {
        // Add 1 month or 1 year
        if (planType === PlanType.ANNUAL) {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
      }

      const membership = membershipRepo.create({
        tierType: tierEnum, // keep legacy if present
        tier: tierEntity,
        user,
        startDate,
        expiresAt,
        endDate: expiresAt,
        isActive: true,
        planType,
        payment: savedPayment,
      });

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

    // If we want strict "one trial per user ever", we'd check if any previous membership had isTrial=true
    const trialUsage = await this.membershipRepository.findOne({
      where: { user: { id: user.id }, isTrial: true },
    });
    if (trialUsage) {
      throw new ForbiddenException('User has already used their trial period.');
    }

    const tier = await this.tierRepository.findOne({
      where: { id: tierId },
      relations: ['season'],
    });
    if (!tier) throw new NotFoundException('Tier not found');

    return this.dataSource.transaction(async (manager) => {
      const membershipRepo = manager.getRepository(Membership);
      const userRepo = manager.getRepository(User);

      // Use the tier's trial duration, default to 14 days if not set
      const trialDurationDays = tier.trialDuration || 14;

      let startDate = new Date();
      let expiresAt = new Date();

      if (tier.type === TierType.SEASONAL && tier.season) {
        startDate = new Date(tier.season.startDate);
        expiresAt = new Date(tier.season.endDate);
      } else {
        expiresAt.setDate(expiresAt.getDate() + trialDurationDays);
      }

      const membership = membershipRepo.create({
        tier,
        user,
        startDate,
        expiresAt,
        endDate: expiresAt,
        isActive: true,
        isTrial: true,
        trialDuration: trialDurationDays,
        planType: PlanType.MONTHLY, // Default to monthly after trial usually
      });

      const savedMembership = await membershipRepo.save(membership);
      user.membership = savedMembership;
      await userRepo.save(user);

      return savedMembership;
    });
  }

  async grantAccess(
    user: User,
    tierId: string,
    durationDays: number,
  ): Promise<Membership> {
    const tier = await this.tierRepository.findOne({
      where: { id: tierId },
      relations: ['season'],
    });
    if (!tier) throw new NotFoundException('Tier not found');

    // Check for existing active membership
    const existingMembership = await this.membershipRepository.findOne({
      where: { user: { id: user.id }, isActive: true },
    });
    if (existingMembership) {
      // In a real scenario we might extend it, or upgrade it.
      // For now, we will expire the old one and create new one (Upgrade/Replace behavior).
      existingMembership.isActive = false;
      await this.membershipRepository.save(existingMembership);
    }

    return this.dataSource.transaction(async (manager) => {
      const membershipRepo = manager.getRepository(Membership);
      const userRepo = manager.getRepository(User);

      let startDate = new Date();
      let expiresAt = new Date();

      if (tier.type === TierType.SEASONAL && tier.season) {
        startDate = new Date(tier.season.startDate);
        expiresAt = new Date(tier.season.endDate);
      } else {
        expiresAt.setDate(expiresAt.getDate() + durationDays);
      }

      const membership = membershipRepo.create({
        tier,
        user,
        startDate,
        expiresAt,
        endDate: expiresAt,
        isActive: true,
        planType: PlanType.MONTHLY, // Default
        // We could add a note or flag about source if entity supported it
      });

      const savedMembership = await membershipRepo.save(membership);
      user.membership = savedMembership;
      await userRepo.save(user);

      return savedMembership;
    });
  }
}
