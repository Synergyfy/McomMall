import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { PaymentsService } from '../services/payments.service';
import { McomPayService } from '../services/mcom-pay.service';

@ApiTags('payments-webhooks')
@Controller('payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mcomPayService: McomPayService,
  ) {}

  /**
   * MCOM Pay lifecycle webhook (payment.succeeded / payment.refunded).
   *
   * This is the only payment webhook: direct Stripe/PayPal webhooks were
   * removed because MCOM Central owns those merchant accounts and their
   * ledgers. The endpoint persists every delivery for audit, processes each
   * payload once, and returns 5xx on a processing failure so Central retries.
   */
  @Public()
  @Post('mcom/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MCOM Pay webhook receiver (signature verified)' })
  async mcomPayWebhook(
    @Req() req: any,
    @Headers('x-mcom-webhook-signature') signature?: string,
  ) {
    const rawBody =
      req.rawBody ||
      (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    if (!this.mcomPayService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('Rejected MCOM Pay webhook: invalid signature');
      throw new UnauthorizedException('Invalid MCOM Pay webhook signature');
    }

    const event = String(req.body?.event ?? 'unknown');
    const data = req.body?.data ?? {};
    const chargeId: string | undefined =
      data.chargeId || data.id || req.body?.chargeId;

    const { duplicate, record } = await this.mcomPayService.recordWebhookEvent({
      event,
      chargeId,
      payload: req.body ?? {},
      rawBody,
    });

    if (duplicate && record.processedAt) {
      this.logger.log(
        `Ignoring duplicate MCOM Pay webhook "${event}"${chargeId ? ` for charge ${chargeId}` : ''}`,
      );
      return { received: true, duplicate: true };
    }

    try {
      await this.paymentsService.handleMcomPayEvent(req.body ?? {});
      await this.mcomPayService.markWebhookProcessed(record.id);
    } catch (err: any) {
      await this.mcomPayService.markWebhookProcessed(record.id, err);
      this.logger.error(
        `MCOM Pay webhook "${event}"${chargeId ? ` for charge ${chargeId}` : ''} failed: ${err?.message || err}`,
      );
      // Return 5xx so Central retries the delivery.
      throw err;
    }

    this.logger.log(
      `MCOM Pay webhook "${event}"${chargeId ? ` for charge ${chargeId}` : ''} processed`,
    );
    return { received: true, event };
  }
}
