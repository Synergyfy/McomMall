import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MCOM_PAY_PURCHASE_PAID } from '../payments/payments.events';
import { MoneyEngineService } from './money-engine.service';

@Injectable()
export class MoneyVoucherPaymentListener {
  private readonly logger = new Logger(MoneyVoucherPaymentListener.name);

  constructor(private readonly moneyEngineService: MoneyEngineService) {}

  @OnEvent(MCOM_PAY_PURCHASE_PAID)
  async handle(payload: {
    purpose?: string;
    context?: Record<string, any>;
    chargeId: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (
      payload?.purpose !== 'MONEY_VOUCHER' &&
      payload?.purpose !== 'MONEY_VOUCHER_CONTRIBUTION'
    ) {
      return;
    }
    try {
      await this.moneyEngineService.completePurchaseFromWebhook({
        context: payload.context ?? {},
        method: payload.method,
        chargeId: payload.chargeId,
        // Charge id is the stable idempotency key for the verify path.
        providerRef: payload.chargeId,
      });
      this.logger.log(
        `Completed ${payload.purpose} from webhook (${payload.chargeId}).`,
      );
    } catch (err: any) {
      this.logger.error(
        `Money voucher webhook completion failed for ${payload.chargeId}: ${
          err?.message || err
        }`,
      );
      throw err;
    }
  }
}
