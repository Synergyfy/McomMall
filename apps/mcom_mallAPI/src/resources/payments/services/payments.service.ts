import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PaymentHistory } from '../entities/payment-history.entity';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { TrialService } from 'src/resources/trial/trial.service';
import { SubscriptionStatusDto, SubscriptionStatusEnum } from '../dto/subscription-status.dto';
import { CentralIntegrationService } from './central-integration.service';
import { CashbackEvent } from '../../../common/enums/cashback-event.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { MembershipService } from 'src/resources/membership/membership.service';
import { PlanType as MembershipPlanType } from 'src/resources/membership/dto/initiate-membership-payment.dto';
import { PaymentMethod } from 'src/resources/order/entities/order-payment.entity';
import { Tier } from '../../tier/entities/tier.entity';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { CreatePaypalOrderDto } from '../dto/create-paypal-order.dto';
import { PlanType } from '../enums/plan-type.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
    @InjectRepository(Tier)
    private readonly tierRepository: Repository<Tier>,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly trialService: TrialService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
  ) {}

  async createStripePaymentIntent(dto: CreatePaymentIntentDto) {
    let amount = dto.amount;
    const metadata: any = {
        purpose: dto.purpose || PaymentPurpose.MEMBERSHIP,
    };

    if (dto.tierId) {
        const tier = await this.tierRepository.findOne({ where: { id: dto.tierId } });
        if (!tier) throw new NotFoundException('Tier not found');
        
        metadata.tierId = dto.tierId;
        metadata.planType = dto.planType || PlanType.MONTHLY;

        if (dto.planType === PlanType.ANNUAL) {
            amount = Number(tier.annualPrice);
        } else if (dto.planType === PlanType.QUARTERLY) {
            amount = Number(tier.quarterlyPrice);
        } else {
            amount = Number(tier.monthlyPrice);
        }
    }

    if (!amount) throw new BadRequestException('Amount or tierId is required');

    return this.paymentProviderService.createStripePaymentIntent(amount, 'gbp', metadata);
  }

  async createPaypalOrder(dto: CreatePaypalOrderDto) {
    let amount = dto.amount;
    const metadata: any = {
        purpose: dto.purpose || PaymentPurpose.MEMBERSHIP,
    };

    if (dto.tierId) {
        const tier = await this.tierRepository.findOne({ where: { id: dto.tierId } });
        if (!tier) throw new NotFoundException('Tier not found');
        
        metadata.tierId = dto.tierId;
        metadata.planType = dto.planType || PlanType.MONTHLY;

        if (dto.planType === PlanType.ANNUAL) {
            amount = Number(tier.annualPrice);
        } else if (dto.planType === PlanType.QUARTERLY) {
            amount = Number(tier.quarterlyPrice);
        } else {
            amount = Number(tier.monthlyPrice);
        }
    }

    if (!amount) throw new BadRequestException('Amount or tierId is required');

    return this.paymentProviderService.createPaypalOrder(amount, 'gbp', metadata);
  }

  async recordPayment(
    recordPaymentDto: RecordPaymentDto,
    userId: string,
  ): Promise<PaymentHistory> {
    const { amount, currency, planType, paygOption, paymentGateway, transactionId, purpose, tierId } =
      recordPaymentDto;

    // Convert amount to decimal if it's not already
    const decimalAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['membership'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedCurrency = (currency || 'gbp').toLowerCase();
    // Verify with provider to mirror order checkout semantics
    if (paymentGateway === PaymentGateway.STRIPE) {
      const verification = await this.paymentProviderService.verifyStripePaymentIntent(
        transactionId,
        decimalAmount,
        normalizedCurrency,
      );
      if (!verification.ok) {
        throw new BadRequestException(
          `Stripe verification failed: ${verification.reason || 'unknown reason'}`,
        );
      }
    } else if (paymentGateway === PaymentGateway.PAYPAL) {
      const verification = await this.paymentProviderService.captureAndVerifyPaypalOrder(
        transactionId,
        decimalAmount,
        normalizedCurrency,
      );
      if (!verification.ok) {
        throw new BadRequestException(
          `PayPal verification failed: ${verification.reason || 'unknown reason'}`,
        );
      }
    }

    const paymentHistory = this.paymentHistoryRepository.create({
      user,
      amountPaid: decimalAmount,
      currency: normalizedCurrency,
      transactionId,
      planType,
      paygOption,
      paymentGateway,
      purpose,
      tierId,
    });
    
    await this.paymentHistoryRepository.save(paymentHistory);

    // If purpose is MEMBERSHIP, create/update membership
    if (purpose === PaymentPurpose.MEMBERSHIP && tierId) {
        // Map planType
        let mPlanType = MembershipPlanType.MONTHLY;
        if (planType === PlanType.ANNUAL) mPlanType = MembershipPlanType.ANNUAL;
        if (planType === PlanType.QUARTERLY) mPlanType = MembershipPlanType.QUARTERLY;

        const pMethod = paymentGateway === PaymentGateway.STRIPE ? PaymentMethod.STRIPE : PaymentMethod.PAYPAL;

        await this.membershipService.verifyAndCreateMembership({
            paymentProvider: pMethod,
            transactionId,
            purchaseDetails: {
                tierId,
                planType: mPlanType
            }
        }, user);
    }

    // Process Cashback
    if (user.email) {
      await this.centralIntegrationService.processCashback(
        user.email,
        decimalAmount,
        CashbackEvent.ORDER_PAYMENT,
        transactionId,
      );
    }

    return paymentHistory;
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusDto> {
    const trial = await this.trialService.getTrialStatus(userId);

    if (trial) {
      return {
        status: trial.isActive
          ? SubscriptionStatusEnum.TRIAL_ACTIVE
          : SubscriptionStatusEnum.TRIAL_EXPIRED,
        trialEndDate: new Date(Date.now() + trial.remainingTime),
        isPaused: trial.pauses.some((p) => p.resumedAt === null),
        remainingPauses: 2 - trial.pauses.length,
        isTrialPausable: trial.pauses.length < 2,
      };
    }

    const lastPayment = await this.paymentHistoryRepository.findOne({
      where: { user: { id: userId }, trial: null },
      order: { created_at: 'DESC' },
    });

    if (lastPayment) {
      return {
        status: SubscriptionStatusEnum.PAID,
        planType: lastPayment.planType,
        paygOption: lastPayment.paygOption,
      };
    }

    return { status: SubscriptionStatusEnum.INACTIVE };
  }
}
