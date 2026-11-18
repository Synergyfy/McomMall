import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { PaymentHistory } from '../entities/payment-history.entity';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PaymentProviderService } from './payment-provider.service';
import { McomPayService } from './mcom-pay.service';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { MembershipPayment } from '../../membership/entities/membership-payment.entity';
import {
  SubscriptionStatusDto,
  SubscriptionStatusEnum,
} from '../dto/subscription-status.dto';
import { CentralIntegrationService } from './central-integration.service';
import { CashbackEvent } from '../../../common/enums/cashback-event.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { MembershipService } from 'src/resources/membership/membership.service';
import { PlansService } from 'src/resources/plans/services/plans.service';
import { PlanType as MembershipPlanType } from 'src/resources/membership/dto/initiate-membership-payment.dto';
import { PaymentMethod } from 'src/resources/order/entities/order-payment.entity';
import { OrderPayment } from '../../order/entities/order-payment.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderStatus } from '../../order/enums/order-status.enum';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { CreatePaypalOrderDto } from '../dto/create-paypal-order.dto';
import { PlanType } from '../enums/plan-type.enum';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(MembershipPayment)
    private readonly membershipPaymentRepository: Repository<MembershipPayment>,
    private readonly mcomPayService: McomPayService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    private readonly plansService: PlansService,
  ) {}

  async createStripePaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    let amount = dto.amount;
    const purpose = dto.purpose || PaymentPurpose.MEMBERSHIP;
    const metadata: any = {
      purpose,
      mallUserId: userId,
      userId,
      reference: dto.idempotencyKey || `mall-payment-${userId}`,
      idempotencyKey:
        dto.idempotencyKey || `payment-intent-${userId}-${randomUUID()}`,
    };

    const variantId = dto.planVariantId || dto.tierId;
    if (variantId) {
      const { price } = await this.plansService.resolveActivePrice(variantId);
      amount = Number(price.amount);
      metadata.planVariantId = variantId;
      metadata.priceId = price.id;
      metadata.planType = dto.planType || PlanType.MONTHLY;
    }

    if (purpose === PaymentPurpose.MEMBERSHIP && !variantId) {
      throw new BadRequestException(
        'A planVariantId or tierId is required for membership payments.',
      );
    }
    if (!amount)
      throw new BadRequestException('Amount or planVariantId is required');

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      Number(amount) > 50000
    ) {
      throw new BadRequestException('Amount must be between 0 and 50000');
    }

    return this.paymentProviderService.createStripePaymentIntent(
      amount,
      'gbp',
      metadata,
    );
  }

  async createPaypalOrder(dto: CreatePaypalOrderDto, userId: string) {
    let amount = dto.amount;
    const purpose = dto.purpose || PaymentPurpose.MEMBERSHIP;
    const metadata: any = {
      purpose,
      mallUserId: userId,
      userId,
      reference: dto.idempotencyKey || `mall-payment-${userId}`,
      idempotencyKey:
        dto.idempotencyKey || `payment-intent-${userId}-${randomUUID()}`,
    };

    const variantId = dto.planVariantId || dto.tierId;
    if (variantId) {
      const { price } = await this.plansService.resolveActivePrice(variantId);
      amount = Number(price.amount);
      metadata.planVariantId = variantId;
      metadata.priceId = price.id;
      metadata.planType = dto.planType || PlanType.MONTHLY;
    }

    if (purpose === PaymentPurpose.MEMBERSHIP && !variantId) {
      throw new BadRequestException(
        'A planVariantId or tierId is required for membership payments.',
      );
    }
    if (!amount)
      throw new BadRequestException('Amount or planVariantId is required');

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      Number(amount) > 50000
    ) {
      throw new BadRequestException('Amount must be between 0 and 50000');
    }

    return this.paymentProviderService.createPaypalOrder(
      amount,
      'gbp',
      metadata,
    );
  }

  async recordPayment(
    recordPaymentDto: RecordPaymentDto,
    userId: string,
  ): Promise<PaymentHistory> {
    const {
      amount,
      currency,
      planType,
      paygOption,
      paymentGateway,
      transactionId: incomingTransactionId,
      purpose,
      tierId,
      planVariantId,
    } = recordPaymentDto;
    const paymentPurpose = purpose || PaymentPurpose.MEMBERSHIP;
    let transactionId = incomingTransactionId || '';

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['membership'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Idempotency: a retry with an already-recorded payment returns it as-is.
    if (transactionId) {
      const existingPayment = await this.paymentHistoryRepository.findOne({
        where: { transactionId },
      });
      if (existingPayment) return existingPayment;
    }

    const normalizedCurrency = (currency || 'gbp').toLowerCase();
    let decimalAmount =
      typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    // Price always comes from the server for plan purchases.
    const targetVariantId = planVariantId || tierId;
    if (targetVariantId) {
      const { price } = await this.plansService.resolveActivePrice(
        targetVariantId,
      );
      decimalAmount = Number(price.amount);
    }

    if (
      !Number.isFinite(decimalAmount) ||
      decimalAmount <= 0 ||
      decimalAmount > 50000
    ) {
      throw new BadRequestException('Invalid payment amount.');
    }

    const providerMethod =
      paymentGateway === PaymentGateway.STRIPE
        ? PaymentMethod.STRIPE
        : paymentGateway === PaymentGateway.MCOM_WALLET
          ? PaymentMethod.MCOM_WALLET
          : PaymentMethod.PAYPAL;

    let mcomChargeId: string | null = null;
    let providerRef: string | null = null;
    let feeMinor: string | null = null;
    let netMinor: string | null = null;
    let membership: any = null;

    if (paymentPurpose === PaymentPurpose.MEMBERSHIP && targetVariantId) {
      let mPlanType = MembershipPlanType.MONTHLY;
      if (planType === PlanType.ANNUAL) mPlanType = MembershipPlanType.ANNUAL;
      if (planType === PlanType.QUARTERLY)
        mPlanType = MembershipPlanType.QUARTERLY;

      // Membership owns verification, wallet capture and charge allocation.
      membership = await this.membershipService.verifyAndCreateMembership(
        {
          paymentProvider: providerMethod,
          transactionId: incomingTransactionId,
          holdId: recordPaymentDto.holdId,
          purchaseDetails: {
            tierId,
            planVariantId,
            planType: mPlanType,
          },
        },
        user,
      );

      const membershipPayment = membership?.payment;
      transactionId =
        membershipPayment?.transactionId ||
        incomingTransactionId ||
        recordPaymentDto.holdId ||
        '';
      mcomChargeId = membershipPayment?.mcomChargeId ?? null;
      providerRef = membershipPayment?.providerRef ?? null;
      feeMinor = membershipPayment?.feeMinor ?? null;
      netMinor = membershipPayment?.netMinor ?? null;
      if (membershipPayment?.amount != null) {
        decimalAmount = Number(membershipPayment.amount);
      }
    } else {
      // Non-membership records (legacy PAYG/admin) verify directly.
      if (paymentGateway === PaymentGateway.MCOM_WALLET) {
        const walletReference = recordPaymentDto.holdId || transactionId;
        if (!walletReference) {
          throw new BadRequestException(
            'A wallet payment reference is required for MCOM Wallet payments.',
          );
        }
        if (!user.centralUserId) {
          throw new BadRequestException(
            'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
          );
        }
        const verification =
          await this.paymentProviderService.settleWalletReference(
            walletReference,
            decimalAmount,
            'GBP',
            {
              mallUserId: userId,
              mcomUserId: user.centralUserId,
              holdId: recordPaymentDto.holdId,
              reference: `payment-${userId}`,
            },
            `capture-${walletReference}`,
          );
        if (!verification.ok) {
          throw new BadRequestException(
            `MCOM Wallet verification failed: ${verification.reason || 'unknown reason'}`,
          );
        }
        const details: any = verification.details ?? {};
        transactionId =
          details.transactionId || details.id || walletReference;
        mcomChargeId =
          details.id && !String(details.id).startsWith('wallet:')
            ? details.id
            : null;
        providerRef = details.providerRef ?? null;
        feeMinor = details.feeMinor ?? null;
        netMinor = details.netMinor ?? null;
      } else if (paymentGateway === PaymentGateway.STRIPE) {
        if (!transactionId) {
          throw new BadRequestException(
            'A Stripe payment reference is required.',
          );
        }
        const verification =
          await this.paymentProviderService.verifyStripePaymentIntent(
            transactionId,
            decimalAmount,
            normalizedCurrency,
            {
              mallUserId: userId,
              mcomUserId: user.centralUserId,
            },
          );
        if (!verification.ok) {
          throw new BadRequestException(
            `Stripe verification failed: ${verification.reason || 'unknown reason'}`,
          );
        }
        const details: any = verification.details ?? {};
        mcomChargeId = details.id ?? null;
        providerRef = details.providerRef ?? null;
        feeMinor = details.feeMinor ?? null;
        netMinor = details.netMinor ?? null;
      } else if (paymentGateway === PaymentGateway.PAYPAL) {
        if (!transactionId) {
          throw new BadRequestException('A PayPal order ID is required.');
        }
        const verification =
          await this.paymentProviderService.captureAndVerifyPaypalOrder(
            transactionId,
            decimalAmount,
            normalizedCurrency,
            {
              mallUserId: userId,
              mcomUserId: user.centralUserId,
            },
          );
        if (!verification.ok) {
          throw new BadRequestException(
            `PayPal verification failed: ${verification.reason || 'unknown reason'}`,
          );
        }
        const details: any = verification.details ?? {};
        mcomChargeId = details.id ?? null;
        providerRef = details.providerRef ?? null;
        feeMinor = details.feeMinor ?? null;
        netMinor = details.netMinor ?? null;
      }
    }

    if (!transactionId) {
      throw new BadRequestException(
        'A payment reference could not be resolved.',
      );
    }

    const paymentHistory = this.paymentHistoryRepository.create({
      user,
      amountPaid: decimalAmount,
      currency: normalizedCurrency,
      transactionId,
      planType,
      paygOption,
      paymentGateway,
      purpose: paymentPurpose,
      tierId,
      planVariantId: planVariantId ?? null,
      mcomChargeId,
      providerRef,
      feeMinor,
      netMinor,
      status: 'paid',
    });

    try {
      await this.paymentHistoryRepository.save(paymentHistory);
    } catch (err: any) {
      // A concurrent retry may have won the unique transaction id race.
      const replay = await this.paymentHistoryRepository.findOne({
        where: { transactionId },
      });
      if (replay) return replay;
      throw err;
    }

    if (!membership) {
      await this.paymentProviderService.allocateCharge({
        mcomChargeId: mcomChargeId || `wallet:${transactionId}`,
        purpose: paymentPurpose,
        entityType: 'payment_history',
        entityId: paymentHistory.id,
        userId,
        amountMinor: String(Math.round(decimalAmount * 100)),
        currency: 'GBP',
      });

      if (user.email) {
        try {
          await this.centralIntegrationService.processCashback(
            user.email,
            decimalAmount,
            CashbackEvent.ORDER_PAYMENT,
            transactionId,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process cashback for payment ${transactionId}: ${error.message}`,
          );
        }
      }
    }

    return paymentHistory;
  }

  /**
   * Webhook backstop: persist the charge and reconcile the business record.
   *
   * Browser confirmation can be interrupted after money moves; the webhook is
   * what guarantees a paid order/booking eventually reaches its final state.
   */
  async handleMcomPayEvent(payload: Record<string, any>): Promise<void> {
    const data = payload?.data ?? {};
    const chargeId: string | undefined =
      data.chargeId || data.id || payload?.chargeId;
    if (!chargeId) return;

    await this.mcomPayService.upsertFromWebhook(chargeId, {
      ...data,
      event: payload?.event,
    });

    const allocation = await this.mcomPayService.getAllocation(chargeId);
    if (!allocation) {
      this.logger.warn(
        `MCOM Pay charge ${chargeId} has no local allocation (event ${payload?.event}).`,
      );
      return;
    }

    const status = String(data.status || (payload?.event === 'payment.succeeded' ? 'paid' : 'refunded'));

    if (allocation.purpose === 'ORDER') {
      await this.orderPaymentRepository.update(
        { mcomChargeId: chargeId },
        { status },
      );
      if (status === 'paid') {
        const order = await this.orderRepository.findOne({
          where: { id: allocation.entityId },
        });
        if (order && order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.COMPLETED;
          await this.orderRepository.save(order);
          this.logger.log(
            `Completed order ${order.id} from MCOM Pay webhook (${chargeId}).`,
          );
        }
      }
    } else if (allocation.purpose === 'MEMBERSHIP') {
      await this.membershipPaymentRepository.update(
        { mcomChargeId: chargeId },
        { status },
      );
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      const membership = user
        ? await this.membershipService.findOne(user)
        : null;

      if (membership && membership.isTrial) {
        // Populate tasks
        // Tasks map default state without activity timer service
        const tasksMap = {
          createdBusiness: false,
          createdProductOrService: false,
          createdOffer: false,
          createdCoupon: false,
        };

        return {
          status: membership.isActive
            ? SubscriptionStatusEnum.TRIAL_ACTIVE
            : SubscriptionStatusEnum.TRIAL_EXPIRED,
          trialEndDate: membership.expiresAt,
          isPaused: false,
          remainingPauses: 0,
          isTrialPausable: false,
          tasks: tasksMap,
          programmeTasks: membership.programmeTasks || [],
        };
      }
    } catch (e) {
      // Membership not found, ignore
    }

    const lastPayment = await this.paymentHistoryRepository.findOne({
      where: { user: { id: userId } },
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

  async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    return this.paymentHistoryRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

}
