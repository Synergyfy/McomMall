import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MCOM_PAY_PURCHASE_PAID } from '../payments/payments.events';
import { paymentMethodFromMcom } from '../payments/payment-method.util';
import { VoucherService } from './voucher.service';

@Injectable()
export class VoucherPaymentListener {
  private readonly logger = new Logger(VoucherPaymentListener.name);

  constructor(private readonly voucherService: VoucherService) {}

  @OnEvent(MCOM_PAY_PURCHASE_PAID)
  async handle(payload: {
    purpose?: string;
    context?: Record<string, any>;
    chargeId: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (
      payload?.purpose !== 'VOUCHER' &&
      payload?.purpose !== 'VOUCHER_RELOAD'
    ) {
      return;
    }
    const context = payload.context ?? {};
    const transactionId = payload.chargeId;
    const paymentProvider = paymentMethodFromMcom(payload.method);
    try {
      if (payload.purpose === 'VOUCHER') {
        await this.voucherService.verifyAndCompletePurchase(
          {
            paymentProvider,
            transactionId,
            purchaseDetails: context.purchaseDetails,
          },
          context.userId,
        );
      } else {
        await this.voucherService.verifyAndCompleteReload(
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
        `Completed voucher ${payload.purpose} from webhook (${payload.chargeId}).`,
      );
    } catch (err: any) {
      this.logger.error(
        `Voucher webhook completion failed for ${payload.chargeId}: ${
          err?.message || err
        }`,
      );
      throw err;
    }
  }
}
