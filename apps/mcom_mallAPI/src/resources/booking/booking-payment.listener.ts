import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingService } from './booking.service';
import { MCOM_PAY_BOOKING_PAID } from '../payments/payments.events';

@Injectable()
export class BookingPaymentListener {
  private readonly logger = new Logger(BookingPaymentListener.name);

  constructor(private readonly bookingService: BookingService) {}

  @OnEvent(MCOM_PAY_BOOKING_PAID)
  async handle(payload: {
    bookingId: string;
    chargeId: string;
    amountMinor: string;
    method: string;
    providerRef?: string | null;
  }) {
    if (!payload?.bookingId) return;
    try {
      await this.bookingService.verifyPaymentFromWebhook(payload);
    } catch (err: any) {
      this.logger.error(
        `Could not confirm booking ${payload.bookingId} from webhook: ${
          err?.message || err
        }`,
      );
      // Re-throw so the webhook returns 5xx and Central retries.
      throw err;
    }
  }
}
