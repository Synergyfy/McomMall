import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MCOM_PAY_PURCHASE_PAID } from '../payments.events';
import { WalletTopUpProxyService } from '../services/wallet-topup-proxy.service';

@Injectable()
export class WalletTopUpPaymentListener {
  private readonly logger = new Logger(WalletTopUpPaymentListener.name);

  constructor(private readonly walletTopUp: WalletTopUpProxyService) {}

  @OnEvent(MCOM_PAY_PURCHASE_PAID)
  async handle(payload: {
    purpose?: string;
    context?: Record<string, any>;
    chargeId: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (payload?.purpose !== 'WALLET_TOPUP') return;
    try {
      await this.walletTopUp.confirmTopUp(
        payload.context?.userId,
        payload.chargeId,
        payload.providerRef || payload.chargeId,
      );
      this.logger.log(
        `Completed wallet top-up from webhook (${payload.chargeId}).`,
      );
    } catch (err: any) {
      this.logger.error(
        `Wallet top-up webhook completion failed for ${payload.chargeId}: ${
          err?.message || err
        }`,
      );
      throw err;
    }
  }
}
