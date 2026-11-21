import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MCOM_PAY_PURCHASE_PAID } from '../payments/payments.events';
import { MembershipService } from './membership.service';

@Injectable()
export class MembershipPaymentListener {
  private readonly logger = new Logger(MembershipPaymentListener.name);

  constructor(private readonly membershipService: MembershipService) {}

  @OnEvent(MCOM_PAY_PURCHASE_PAID)
  async handle(payload: {
    purpose?: string;
    context?: Record<string, any>;
    chargeId: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (payload?.purpose !== 'MEMBERSHIP') return;
    try {
      await this.membershipService.verifyMembershipFromWebhook({
        context: payload.context ?? {},
        method: payload.method,
        chargeId: payload.chargeId,
        // Charge id is the stable idempotency key stored by the verify path.
        providerRef: payload.chargeId,
      });
      this.logger.log(
        `Completed membership payment from webhook (${payload.chargeId}).`,
      );
    } catch (err: any) {
      this.logger.error(
        `Membership webhook completion failed for ${payload.chargeId}: ${
          err?.message || err
        }`,
      );
      throw err;
    }
  }
}
