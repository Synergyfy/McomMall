import {
  Controller,
  Post,
  Headers,
  Body,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import * as crypto from 'crypto';

@ApiTags('mcom-webhooks')
@Controller()
export class McomWebhookController {
  private readonly logger = new Logger(McomWebhookController.name);

  private getWebhookSecret(): string {
    const secret =
      process.env.SSO_WEBHOOK_SECRET ||
      process.env.MCOM_WEBHOOK_SECRET ||
      process.env.SSO_API_SECRET ||
      process.env.SSO_CLIENT_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Webhook secret is not configured');
    }
    return secret;
  }

  @Public()
  @Post(['webhooks/mcom', 'sso/webhook'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive MCOM Central entitlement webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('x-mcom-webhook-signature') signature: string,
    @Body() payload: any,
    @Req() req: any,
  ) {
    const secret = this.getWebhookSecret();

    // Signature is mandatory: reject unsigned webhooks.
    if (!signature) {
      this.logger.warn('Rejected unsigned webhook from MCOM Central');
      throw new UnauthorizedException('Missing webhook signature');
    }

    const rawBody =
      typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(payload);
    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const provided = Buffer.from(signature);
    const expected = Buffer.from(computed);
    if (
      provided.length !== expected.length ||
      !crypto.timingSafeEqual(provided, expected)
    ) {
      this.logger.warn('Invalid webhook signature received from MCOM Central');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = payload?.event || payload?.type;
    const data = payload?.data || payload;
    const userId = data?.userId || data?.centralUserId || data?.businessId;

    this.logger.log(
      `Received MCOM webhook event: ${event} for user: ${userId}`,
    );

    // Invalidate local subscription guard cache for immediate fresh check
    if (userId) {
      SubscriptionGuard.clearCache(userId);
    }

    return { received: true, event };
  }
}
