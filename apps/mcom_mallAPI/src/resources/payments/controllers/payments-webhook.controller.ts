import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { WebhookSourceGuard } from '../../../common/guards/webhook-source.guard';
import { PaymentsService } from '../services/payments.service';
import { PaymentProviderService } from '../services/payment-provider.service';
import { McomPayService } from '../services/mcom-pay.service';

@ApiTags('payments-webhooks')
@Controller('payments')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly mcomPayService: McomPayService,
  ) {}

  /**
   * MCOM Pay lifecycle webhook (payment.succeeded / payment.refunded).
   * Signed with the app's webhook secret; used as a backstop for payments whose
   * browser confirmation was interrupted.
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

    const event = req.body?.event;
    const chargeId =
      req.body?.data?.chargeId ||
      req.body?.data?.id ||
      req.body?.chargeId;
    const status = req.body?.data?.status;

    if (chargeId && typeof chargeId === 'string') {
      if (event === 'payment.succeeded') {
        await this.mcomPayService.updateLocalStatus(chargeId, 'paid');
      } else if (event === 'payment.refunded') {
        await this.mcomPayService.updateLocalStatus(
          chargeId,
          status || 'refunded',
        );
      }
    }

    this.logger.log(
      `MCOM Pay webhook "${event ?? 'unknown'}"${chargeId ? ` for charge ${chargeId}` : ''}`,
    );
    return { received: true, event: event ?? 'unknown' };
  }

  @Public()
  @UseGuards(WebhookSourceGuard)
  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook receiver (signature verified)' })
  @ApiResponse({ status: 200, description: 'Event received' })
  async stripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Always verify against the exact raw bytes Stripe signed. Never fall back
    // to the re-serialised body, which would not match the signature.
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    let event: any;
    try {
      event = this.paymentProviderService.constructStripeEvent(
        rawBody,
        signature,
      );
    } catch (err: any) {
      // Misconfiguration is a server error; anything else is a bad signature.
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      this.logger.warn(`Rejected Stripe webhook: ${err?.message}`);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    // Replay protection: ignore events we have already processed.
    if (this.paymentsService.isDuplicateWebhookEvent(event.id)) {
      this.logger.log(`Ignoring duplicate Stripe event ${event.id}`);
      return { received: true, duplicate: true };
    }

    // Reject test-mode events in production so sandbox traffic can never
    // mutate live orders.
    if (process.env.NODE_ENV === 'production' && event.livemode === false) {
      this.logger.warn(`Rejected Stripe test-mode event ${event.id}`);
      throw new BadRequestException('Test-mode Stripe events are not accepted');
    }

    await this.paymentsService.handleStripeWebhookEvent(event);
    return { received: true, type: event.type };
  }

  @Public()
  @UseGuards(WebhookSourceGuard)
  @Post('paypal/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayPal webhook receiver (signature verified)' })
  @ApiResponse({ status: 200, description: 'Event received' })
  async paypalWebhook(
    @Req() req: any,
    @Headers() headers: Record<string, any>,
  ) {
    // Require the PayPal transmission headers up-front so unsigned requests
    // are rejected before any outbound verification call is made.
    if (
      !headers['paypal-transmission-id'] ||
      !headers['paypal-transmission-sig'] ||
      !headers['paypal-cert-url'] ||
      !headers['paypal-auth-algo']
    ) {
      throw new BadRequestException('Missing PayPal webhook signature headers');
    }

    const verification = await this.paymentProviderService.verifyPaypalWebhook(
      headers,
      req.body,
    );
    if (!verification.ok) {
      this.logger.warn(
        `Rejected PayPal webhook: ${verification.reason ?? 'verification failed'}`,
      );
      throw new UnauthorizedException('Invalid PayPal webhook signature');
    }

    // Replay protection by event id.
    const eventId = req.body?.id;
    if (this.paymentsService.isDuplicateWebhookEvent(eventId)) {
      this.logger.log(`Ignoring duplicate PayPal event ${eventId}`);
      return { received: true, duplicate: true };
    }

    await this.paymentsService.handlePaypalWebhookEvent(req.body ?? {});
    return { received: true };
  }
}
