import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderService } from './order.service';
import { MCOM_PAY_INTENT_PAID } from '../payments/payments.events';

/**
 * Completes a quote-bound checkout when MCOM Pay reports the charge as paid
 * but the browser never called `/order/checkout` (closed tab, lost network).
 *
 * Registered in OrderModule so PaymentsService does not need to depend on
 * OrderService (which would create a module cycle).
 */
@Injectable()
export class OrderPaymentIntentListener {
  private readonly logger = new Logger(OrderPaymentIntentListener.name);

  constructor(private readonly orderService: OrderService) {}

  @OnEvent(MCOM_PAY_INTENT_PAID)
  async handle(payload: { intentId: string; chargeId?: string }) {
    if (!payload?.intentId) return;
    try {
      await this.orderService.completeCheckoutPaymentIntentFromWebhook(
        payload.intentId,
      );
    } catch (err: any) {
      this.logger.error(
        `Could not complete checkout intent ${payload.intentId} from webhook: ${
          err?.message || err
        }`,
      );
      // Re-throw so the webhook returns 5xx and Central retries the delivery.
      throw err;
    }
  }
}
