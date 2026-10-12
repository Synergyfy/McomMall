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
import { User } from '../../users/entities/user.entity';
import { PaymentHistory } from '../entities/payment-history.entity';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentGateway } from '../enums/payment-gateway.enum';
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
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    private readonly plansService: PlansService,
  ) {}

  async createStripePaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    let amount = dto.amount;
    const metadata: any = {
      purpose: dto.purpose || PaymentPurpose.MEMBERSHIP,
      mallUserId: userId,
    };

    const variantId = dto.planVariantId || dto.tierId;
    if (variantId) {
      const { price } = await this.plansService.resolveActivePrice(variantId);
      amount = Number(price.amount);
      metadata.planVariantId = variantId;
      metadata.priceId = price.id;
      metadata.planType = dto.planType || PlanType.MONTHLY;
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
    const metadata: any = {
      purpose: dto.purpose || PaymentPurpose.MEMBERSHIP,
      mallUserId: userId,
    };

    const variantId = dto.planVariantId || dto.tierId;
    if (variantId) {
      const { price } = await this.plansService.resolveActivePrice(variantId);
      amount = Number(price.amount);
      metadata.planVariantId = variantId;
      metadata.priceId = price.id;
      metadata.planType = dto.planType || PlanType.MONTHLY;
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
      transactionId,
      purpose,
      tierId,
      planVariantId,
    } = recordPaymentDto;
    const walletHoldId =
      paymentGateway === PaymentGateway.MCOM_WALLET
        ? recordPaymentDto.holdId || transactionId
        : undefined;

    // Convert amount to decimal if it's not already
    // Idempotency check: return existing payment history if transactionId already recorded
    const existingPayment = await this.paymentHistoryRepository.findOne({
      where: { transactionId },
    });
    if (existingPayment) {
      return existingPayment;
    }

    const decimalAmount =
      typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['membership'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedCurrency = (currency || 'gbp').toLowerCase();
    // Verify with provider to mirror order checkout semantics.
    // MCOM Wallet holds are captured inside verifyAndCreateMembership, so
    // there is no provider intent to verify here. Centrally-processed
    // (viaSolutions) card/PayPal payments were created and verified by MCOM
    // Solutions (their Stripe/PayPal accounts) — the mall cannot retrieve
    // those intents with its own keys, so verification is delegated to
    // verifyAndCreateMembership's Solutions confirm/capture below.
    const skipProviderVerification =
      recordPaymentDto.viaSolutions === true &&
      purpose === PaymentPurpose.MEMBERSHIP &&
      (paymentGateway === PaymentGateway.STRIPE ||
        paymentGateway === PaymentGateway.PAYPAL);
    if (paymentGateway === PaymentGateway.MCOM_WALLET) {
      if (!walletHoldId) {
        throw new BadRequestException(
          'A wallet hold ID is required for MCOM Wallet payments.',
        );
      }
    } else if (paymentGateway === PaymentGateway.STRIPE) {
      if (skipProviderVerification) {
        this.logger.log(
          `Skipping mall-side Stripe verification for centrally-processed membership payment ${transactionId}`,
        );
      } else {
        const verification =
          await this.paymentProviderService.verifyStripePaymentIntent(
            transactionId,
            decimalAmount,
            normalizedCurrency,
          );
        if (!verification.ok) {
          throw new BadRequestException(
            `Stripe verification failed: ${verification.reason || 'unknown reason'}`,
          );
        }
      }
    } else if (paymentGateway === PaymentGateway.PAYPAL) {
      if (skipProviderVerification) {
        this.logger.log(
          `Skipping mall-side PayPal verification for centrally-processed membership payment ${transactionId}`,
        );
      } else {
        const verification =
          await this.paymentProviderService.captureAndVerifyPaypalOrder(
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
      planVariantId: planVariantId ?? null,
    });

    await this.paymentHistoryRepository.save(paymentHistory);

    // If purpose is MEMBERSHIP, create/update membership
    if (purpose === PaymentPurpose.MEMBERSHIP && (tierId || planVariantId)) {
      // Map planType
      let mPlanType = MembershipPlanType.MONTHLY;
      if (planType === PlanType.ANNUAL) mPlanType = MembershipPlanType.ANNUAL;
      if (planType === PlanType.QUARTERLY)
        mPlanType = MembershipPlanType.QUARTERLY;

      const pMethod =
        paymentGateway === PaymentGateway.STRIPE
          ? PaymentMethod.STRIPE
          : paymentGateway === PaymentGateway.MCOM_WALLET
            ? PaymentMethod.MCOM_WALLET
            : PaymentMethod.PAYPAL;

      await this.membershipService.verifyAndCreateMembership(
        {
          paymentProvider: pMethod,
          transactionId: walletHoldId || transactionId,
          holdId: walletHoldId,
          purchaseDetails: {
            tierId,
            planVariantId,
            planType: mPlanType,
          },
        },
        user,
      );
    }

    // Process Cashback
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
          `Failed to process cashback for order ${transactionId}: ${error.message}`,
        );
      }
    }

    return paymentHistory;
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
          createdPromotion: false,
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

  // --- Webhook reconciliation (out-of-band) ---

  private readonly processedWebhookEvents = new Map<string, number>();
  private static readonly MAX_PROCESSED_WEBHOOK_EVENTS = 5000;

  /**
   * Returns true if the given provider event id has already been handled.
   * Bounded in-memory cache prevents replay of the same signed event within
   * the signature-tolerance window (and duplicate provider retries).
   */
  isDuplicateWebhookEvent(eventId?: string): boolean {
    if (!eventId) return false;
    if (this.processedWebhookEvents.has(eventId)) {
      return true;
    }
    this.processedWebhookEvents.set(eventId, Date.now());
    if (
      this.processedWebhookEvents.size >
      PaymentsService.MAX_PROCESSED_WEBHOOK_EVENTS
    ) {
      const oldest = this.processedWebhookEvents.keys().next().value;
      if (oldest) this.processedWebhookEvents.delete(oldest);
    }
    return false;
  }

  /**
   * Reconciles a verified Stripe event. Successful payments are already
   * handled synchronously by the checkout paths; here we only react to
   * failures/refunds to keep the order state consistent if a client never
   * completes the flow.
   */
  async handleStripeWebhookEvent(event: {
    id: string;
    type: string;
    data: { object: any };
  }): Promise<void> {
    this.logger.log(`Stripe webhook ${event.id} received (${event.type})`);

    const object = event.data?.object ?? {};
    let transactionId: string | undefined;
    if (event.type === 'charge.refunded') {
      transactionId = object.payment_intent;
    } else if (
      event.type === 'payment_intent.payment_failed' ||
      event.type === 'payment_intent.canceled'
    ) {
      transactionId = object.id;
    }

    if (transactionId) {
      await this.markOrderPaymentFailed(transactionId);
    }
  }

  /**
   * Reconciles a verified PayPal webhook. PayPal's resource id is the capture
   * id, which we do not store against orders, so this is currently
   * logging-only; refunds/failures are handled synchronously on capture.
   */
  async handlePaypalWebhookEvent(event: {
    id?: string;
    event_type?: string;
  }): Promise<void> {
    this.logger.log(
      `PayPal webhook ${event.id ?? 'unknown'} received (${event.event_type ?? 'unknown'})`,
    );
  }

  private async markOrderPaymentFailed(transactionId: string): Promise<void> {
    const payment = await this.orderPaymentRepository.findOne({
      where: { transactionId },
    });
    if (!payment) {
      this.logger.warn(
        `Webhook referenced unknown payment transaction ${transactionId}`,
      );
      return;
    }
    const order = await this.orderRepository.findOne({
      where: { payment: { id: payment.id } },
    });
    if (order && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.FAILED;
      await this.orderRepository.save(order);
      this.logger.log(`Marked order ${order.id} FAILED from webhook`);
    }
  }
}
