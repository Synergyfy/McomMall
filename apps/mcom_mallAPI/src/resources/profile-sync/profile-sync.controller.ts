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
import { ProfileSyncService } from './profile-sync.service';
import { verifyMcomWebhookSignature } from './webhook-signature';

/**
 * Inbound profile-change signal from MCOM Central.
 *
 * Central sends a signed, payload-light notification and this endpoint pulls
 * the canonical profile back over the service mesh. It is intentionally
 * unauthenticated at the JWT layer (`@Public`) because authenticity comes from
 * the `X-Mcom-Webhook-Signature` HMAC over the raw request body.
 *
 * Register this URL in MCOM Console as the app's **Profile Update Endpoint**:
 *
 *   https://api.mall.mcom.com/api/v1/webhook/profile-updated
 */
@ApiTags('mcom-profile-sync')
@Controller(['webhook', 'webhooks'])
export class ProfileSyncController {
  private readonly logger = new Logger(ProfileSyncController.name);

  constructor(private readonly profileSyncService: ProfileSyncService) {}

  @Public()
  @Post('profile-updated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive a profile.updated / profile.deleted signal from MCOM Central',
    description:
      'Verifies the HMAC signature, deduplicates on data.eventId, then pulls ' +
      'the canonical profile from Central over the RS256 service mesh and ' +
      'mirrors it onto the local user / business. A profile.deleted signal ' +
      'deactivates the account and archives its listings without deleting data.',
  })
  @ApiResponse({ status: 200, description: 'Event accepted (or duplicate)' })
  @ApiResponse({ status: 401, description: 'Missing or invalid signature' })
  @ApiResponse({
    status: 503,
    description: 'Upstream pull failed; Central should retry',
  })
  async handleProfileUpdated(
    @Headers('x-mcom-webhook-signature') signature: string | undefined,
    @Body() payload: any,
    @Req() req: any,
  ) {
    const secret = this.profileSyncService.getWebhookSecret();
    if (!secret) {
      // Fail loudly: silently accepting unsigned events would be worse.
      this.logger.error(
        'Profile sync webhook secret is not configured ' +
          '(MCOM_PROFILE_WEBHOOK_SECRET / MCOM_WEBHOOK_SECRET).',
      );
      throw new ServiceUnavailableException('Webhook secret is not configured');
    }

    // `rawBody` is populated by the JSON body parser in main.ts. The signature
    // must be checked against the exact bytes Central signed.
    const rawBody =
      typeof req?.rawBody === 'string' ? req.rawBody : JSON.stringify(payload);

    if (!verifyMcomWebhookSignature(rawBody, signature, secret)) {
      this.logger.warn(
        'Rejected profile webhook: missing or invalid signature',
      );
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return this.profileSyncService.handleIncomingEvent(payload);
  }
}
