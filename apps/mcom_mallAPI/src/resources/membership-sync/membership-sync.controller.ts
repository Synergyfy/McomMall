import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MembershipSyncService } from './membership-sync.service';
import { verifyMcomWebhookSignature } from '../profile-sync/webhook-signature';

/**
 * Inbound membership-change signal from MCOM Central.
 *
 * When a business buys a Central membership plan that bundles this app,
 * Central provisions the matching platform package and POSTs
 * `membership.updated` here. Authenticity comes from the
 * `X-Mcom-Webhook-Signature` HMAC over the raw request body, so the route is
 * `@Public` at the JWT layer.
 *
 * Register this URL in MCOM Console under
 * **this app → Configuration → Membership Synchronization**:
 *
 *   https://api.mall.mcom.com/api/v1/webhooks/membership-updated
 */
@ApiTags('mcom-membership-sync')
@Controller(['webhook', 'webhooks'])
export class MembershipSyncController {
  private readonly logger = new Logger(MembershipSyncController.name);

  constructor(private readonly membershipSyncService: MembershipSyncService) {}

  @Public()
  @Post('membership-updated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive a membership.updated signal from MCOM Central',
    description:
      'Verifies the HMAC signature, deduplicates on data.eventId, then maps ' +
      'the bundled package (externalPlanId / packageName) onto a local plan ' +
      'variant and activates or revokes the user’s membership until the ' +
      'membership expiry Central sent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Membership applied, revoked, ignored or duplicate',
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid signature' })
  @ApiResponse({
    status: 503,
    description:
      'Upstream/profile/plan-mapping failure; Central should retry (and the ' +
      'event lands in the dead-letter queue for replay once fixed)',
  })
  async handleMembershipUpdated(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() payload: any,
    @Req() req: any,
  ) {
    const secret = this.membershipSyncService.getWebhookSecret();
    if (!secret) {
      // Fail loudly: silently accepting unsigned events would be worse.
      this.logger.error(
        'Membership sync webhook secret is not configured ' +
          '(MCOM_MEMBERSHIP_WEBHOOK_SECRET / MCOM_WEBHOOK_SECRET / MCOM_HMAC_SECRET).',
      );
      throw new ServiceUnavailableException('Webhook secret is not configured');
    }

    const signature =
      this.headerValue(headers, 'x-mcom-webhook-signature') ||
      this.headerValue(headers, 'x-mcom-signature');

    // `rawBody` is populated by the JSON body parser in main.ts. The signature
    // must be checked against the exact bytes Central signed.
    const rawBody =
      typeof req?.rawBody === 'string' ? req.rawBody : JSON.stringify(payload);

    if (!verifyMcomWebhookSignature(rawBody, signature, secret)) {
      this.logger.warn(
        'Rejected membership webhook: missing or invalid signature',
      );
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return this.membershipSyncService.handleIncomingEvent(payload);
  }

  private headerValue(
    headers: Record<string, string | string[] | undefined>,
    name: string,
  ): string | undefined {
    const value = headers?.[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
