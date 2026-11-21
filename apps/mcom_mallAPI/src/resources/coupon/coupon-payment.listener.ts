import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MCOM_PAY_PURCHASE_PAID } from '../payments/payments.events';
import { paymentMethodFromMcom } from '../payments/payment-method.util';
import { CouponService } from './coupon.service';

@Injectable()
export class CouponPaymentListener {
  private readonly logger = new Logger(CouponPaymentListener.name);

  constructor(private readonly couponService: CouponService) {}

  @OnEvent(MCOM_PAY_PURCHASE_PAID)
  async handle(payload: {
    purpose?: string;
    context?: Record<string, any>;
    chargeId: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (
      payload?.purpose !== 'COUPON' &&
      payload?.purpose !== 'COUPON_RELOAD'
    ) {
      return;
    }
    const context = payload.context ?? {};
    const transactionId = payload.chargeId;
    const paymentProvider = paymentMethodFromMcom(payload.method);
    try {
      if (payload.purpose === 'COUPON') {
        await this.couponService.verifyAndCompleteCouponPurchase(
          {
            paymentProvider,
            transactionId,
            purchaseDetails: context.purchaseDetails,
          },
          context.userId,
        );
      } else {
        await this.couponService.verifyAndCompleteCouponReload(
          context.code,
          {
            amount: context.amount,
            paymentProvider,
            transactionId,
          },
          context.userId,
        );
      }
      this.logger.log(
        `Completed coupon ${payload.purpose} from webhook (${payload.chargeId}).`,
      );
    } catch (err: any) {
      this.logger.error(
        `Coupon webhook completion failed for ${payload.chargeId}: ${
          err?.message || err
        }`,
      );
      throw err;
    }
  }
}
