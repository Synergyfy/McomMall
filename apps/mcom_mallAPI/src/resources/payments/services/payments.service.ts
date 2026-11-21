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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { PaymentHistory } from '../entities/payment-history.entity';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
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
import { ServicePayment } from '../../booking/entities/service-payment.entity';
import { OrderStatus } from '../../order/enums/order-status.enum';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { CreatePaypalOrderDto } from '../dto/create-paypal-order.dto';
import { PlanType } from '../enums/plan-type.enum';
import { McomPaymentIntent } from '../entities/mcom-payment-intent.entity';
import {
  MCOM_PAY_BOOKING_PAID,
  MCOM_PAY_INTENT_PAID,
  MCOM_PAY_PURCHASE_PAID,
} from '../payments.events';

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
    @InjectRepository(ServicePayment)
    private readonly servicePaymentRepository: Repository<ServicePayment>,
    @InjectRepository(MembershipPayment)
    private readonly membershipPaymentRepository: Repository<MembershipPayment>,
    @InjectRepository(McomPaymentIntent)
    private readonly paymentIntentRepository: Repository<McomPaymentIntent>,
    private readonly mcomPayService: McomPayService,
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    private readonly plansService: PlansService,
  ) {}

  async createStripePaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    return this.createGatewayPayment(dto, userId, 'stripe');
  }

  async createPaypalOrder(dto: CreatePaypalOrderDto, userId: string) {
    return this.createGatewayPayment(dto, userId, 'paypal');
  }

  /**
   * One front door for the generic intent/order routes.
   *
   * Membership is delegated to `MembershipService` so plan pricing, wallet
   * holds and membership creation have a single owner. Only genuine one-off
   * PAYG payments are created here.
   */
  private async createGatewayPayment(
    dto: CreatePaymentIntentDto | CreatePaypalOrderDto,
    userId: string,
    rail: 'stripe' | 'paypal',
  ) {
    const purpose = dto.purpose || PaymentPurpose.MEMBERSHIP;

    if (purpose === PaymentPurpose.MEMBERSHIP) {
      const variantId = dto.planVariantId || dto.tierId;
      if (!variantId) {
        throw new BadRequestException(
          'A planVariantId or tierId is required for membership payments.',
        );
      }
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found.');
      return this.membershipService.initiateMembershipPayment(
        {
          paymentProvider:
            rail === 'stripe' ? PaymentMethod.STRIPE : PaymentMethod.PAYPAL,
          planVariantId: dto.planVariantId,
          tierId: dto.tierId,
          planType: dto.planType as any,
          idempotencyKey: dto.idempotencyKey,
        },
        user,
      );
    }

    const amount = dto.amount;
    if (!amount) {
      throw new BadRequestException('An amount is required for this payment.');
    }
    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      Number(amount) > 50000
    ) {
      throw new BadRequestException('Amount must be between 0 and 50000');
    }

    const idempotencyKey =
      dto.idempotencyKey || `payment-intent-${userId}-${randomUUID()}`;
    const initiated = await this.paymentOrchestrator.initiate({
      rail,
      amount: Number(amount),
      currency: 'gbp',
      payer: { mallUserId: userId },
      metadata: { purpose },
      reference: dto.idempotencyKey || `mall-payment-${userId}`,
      idempotencyKey,
      intent: 'PURCHASE',
    });

    if (initiated.rail === 'stripe') {
      return {
        id: initiated.chargeId,
        chargeId: initiated.chargeId,
        providerRef: initiated.providerRef,
        clientSecret: initiated.clientSecret,
        client_secret: initiated.clientSecret,
        amount: initiated.amount,
        currency: initiated.currency,
      };
    }
    if (initiated.rail === 'paypal') {
      return {
        id: initiated.orderId,
        chargeId: initiated.chargeId,
        providerRef: initiated.orderId,
        orderId: initiated.orderId,
        approvalUrl: initiated.approvalUrl,
        amount: initiated.amount,
        currency: initiated.currency,
      };
    }
    throw new BadRequestException('Invalid payment rail specified.');
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
      const walletReference = recordPaymentDto.holdId || transactionId;
      if (paymentGateway === PaymentGateway.MCOM_WALLET) {
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
      } else if (!transactionId) {
        throw new BadRequestException(
          paymentGateway === PaymentGateway.PAYPAL
            ? 'A PayPal order ID is required.'
            : 'A Stripe payment reference is required.',
        );
      }

      const verification = await this.paymentOrchestrator.confirm({
        rail: providerMethod,
        reference: walletReference || transactionId,
        amount: decimalAmount,
        currency: normalizedCurrency,
        payer: { mallUserId: userId, centralUserId: user.centralUserId },
        holdId:
          paymentGateway === PaymentGateway.MCOM_WALLET
            ? recordPaymentDto.holdId
            : undefined,
        contextReference: `payment-${userId}`,
        idempotencyKey:
          paymentGateway === PaymentGateway.MCOM_WALLET
            ? `capture-${walletReference}`
            : undefined,
      });
      if (!verification.ok) {
        throw new BadRequestException(
          `Payment verification failed: ${verification.reason || 'unknown reason'}`,
        );
      }
      if (paymentGateway === PaymentGateway.MCOM_WALLET) {
        transactionId = verification.transactionId || walletReference;
      }
      mcomChargeId = verification.chargeId;
      providerRef = verification.providerRef;
      feeMinor = verification.feeMinor;
      netMinor = verification.netMinor;
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
      // A paid booking charge whose browser never reached verify-payment.
      const reference = String(data.reference ?? '');
      const bookingMatch = reference.match(/^booking-([0-9a-f-]{36})/i);
      if (bookingMatch) {
        await this.eventEmitter.emitAsync(MCOM_PAY_BOOKING_PAID, {
          bookingId: bookingMatch[1],
          chargeId,
          amountMinor: String(data.amountMinor ?? '0'),
          method: String(data.method ?? '').toLowerCase(),
          providerRef: data.providerRef ?? null,
        });
        return;
      }

      // Gift cards, vouchers, coupons, memberships, top-ups and money vouchers
      // freeze their purchase context on the charge at initiation.
      const purchaseContext =
        await this.mcomPayService.getLocalChargeContext(chargeId);
      if (purchaseContext?.purpose) {
        await this.eventEmitter.emitAsync(MCOM_PAY_PURCHASE_PAID, {
          purpose: purchaseContext.purpose,
          context: purchaseContext,
          chargeId,
          amountMinor: String(data.amountMinor ?? '0'),
          method: String(data.method ?? '').toLowerCase(),
          providerRef: data.providerRef ?? null,
        });
        return;
      }

      // No business record was linked yet. For quote-bound checkout intents
      // written before payment, complete the order now. This is what makes a
      // paid charge survive a closed tab.
      let intent = await this.paymentIntentRepository.findOne({
        where: [
          { chargeId },
          ...(data.reference ? [{ reference: String(data.reference) }] : []),
        ],
      });
      if (!intent && data.reference) {
        // Charge references append `-<method>-<amount>` to the intent
        // reference. Recover the intent id if the local charge row is missing.
        const match = String(data.reference).match(
          /^mall-order-([0-9a-f-]{36})/i,
        );
        if (match) {
          intent = await this.paymentIntentRepository.findOne({
            where: { id: match[1] },
          });
        }
      }
      if (intent && intent.status !== 'completed') {
        this.logger.log(
          `Completing checkout intent ${intent.id} from MCOM Pay webhook (${chargeId}).`,
        );
        await this.eventEmitter.emitAsync(MCOM_PAY_INTENT_PAID, {
          intentId: intent.id,
          chargeId,
        });
        return;
      }

      this.logger.warn(
        `MCOM Pay charge ${chargeId} has no local allocation (event ${payload?.event}).`,
      );
      return;
    }

    const status = String(data.status || (payload?.event === 'payment.succeeded' ? 'paid' : 'refunded'));

    // Keep the local payment row in step with Central for every purpose that
    // created an order payment (orders, gift cards, vouchers, coupons, top-ups).
    await this.orderPaymentRepository.update(
      { mcomChargeId: chargeId },
      { status },
    );

    if (allocation.purpose === 'ORDER') {
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
    } else if (allocation.purpose === 'BOOKING') {
      await this.servicePaymentRepository.update(
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
