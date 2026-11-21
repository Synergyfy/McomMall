import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MCOM_PAY_PURCHASE_PAID } from '../payments/payments.events';
import { paymentMethodFromMcom } from '../payments/payment-method.util';
import { GiftCardService } from './gift-card.service';

@Injectable()
export class GiftCardPaymentListener {
  private readonly logger = new Logger(GiftCardPaymentListener.name);

  constructor(private readonly giftCardService: GiftCardService) {}

  @OnEvent(MCOM_PAY_PURCHASE_PAID)
  async handle(payload: {
    purpose?: string;
    context?: Record<string, any>;
    chargeId: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (
      payload?.purpose !== 'GIFT_CARD' &&
      payload?.purpose !== 'GIFT_CARD_RELOAD'
    ) {
      return;
    }
    const context = payload.context ?? {};
    // Use the MCOM charge id: it is the idempotency key these verify methods
    // persist, so a replayed webhook returns the existing card instead of
    // attempting a second issuance/refund.
    const transactionId = payload.chargeId;
    const paymentProvider = paymentMethodFromMcom(payload.method);
    try {
      if (payload.purpose === 'GIFT_CARD') {
        await this.giftCardService.verifyAndCompletePurchase(
          {
            paymentProvider,
            transactionId,
            purchaseDetails: context.purchaseDetails,
          },
          context.userId,
        );
      } else {
        await this.giftCardService.verifyAndCompleteReload(
          context.code,
          {
            paymentProvider,
            transactionId,
            reloadDetails: { amount: context.amount },
          },
          context.userId,
        );
      }
      this.logger.log(
        `Completed gift card ${payload.purpose} from webhook (${payload.chargeId}).`,
      );
    } catch (err: any) {
      this.logger.error(
        `Gift card webhook completion failed for ${payload.chargeId}: ${
          err?.message || err
        }`,
      );
      throw err;
    }
  }
}
