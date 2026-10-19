import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServiceAuthGuard } from '../service-mesh/guards/service-auth.guard';
import { ServiceScopesGuard } from '../service-mesh/guards/service-scopes.guard';
import { RequireServiceScopes } from '../service-mesh/decorators/require-service-scopes.decorator';
import { SERVICE_SCOPE_MALL_WRITE } from '../service-mesh/constants';
import { AuthenticatedServiceRequest } from '../service-mesh/interfaces/authenticated-service-request.interface';
import { RewardIssuanceMirror } from './entities/reward-issuance-mirror.entity';

/**
 * Inbound lifecycle events pushed by MCOM Rewards (reward.issued,
 * reward.redeemed, reward.expired, reward.revoked) over the zero-hop mesh.
 *
 * Verified offline via Central's JWKS (audience = "mcom-mall"); no HMAC or
 * shared webhook secret is used. Delivery is best-effort and idempotent; every
 * event upserts the local issuance mirror.
 */
@ApiTags('Mall Partner Events')
@ApiSecurity('mcom-service-token')
@Controller('partner/events')
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerEventsController {
  private readonly logger = new Logger(PartnerEventsController.name);

  constructor(
    @InjectRepository(RewardIssuanceMirror)
    private readonly mirrorRepository: Repository<RewardIssuanceMirror>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @RequireServiceScopes(SERVICE_SCOPE_MALL_WRITE)
  @ApiOperation({ summary: 'Receive MCOM Rewards lifecycle events' })
  async handle(
    @Body()
    payload: {
      event?: string;
      timestamp?: string;
      source?: string;
      data?: Record<string, any>;
    },
    @Req() req: AuthenticatedServiceRequest,
  ) {
    const event = payload?.event || (payload as any)?.type || 'unknown';
    const data = payload?.data;
    const issuanceId = data?.id;
    const status = data?.status;

    this.logger.log(
      `Received partner event "${event}" from ${req.serviceCaller?.callerAppId}` +
        (issuanceId ? ` (issuance=${issuanceId}, status=${status})` : ''),
    );

    if (issuanceId) {
      await this.upsertMirror(String(issuanceId), event, payload);
    }

    return { received: true, event };
  }

  /** Idempotent upsert keyed on the rewards issuance id. */
  private async upsertMirror(
    id: string,
    event: string,
    payload: { timestamp?: string; data?: Record<string, any> },
  ): Promise<void> {
    const data = payload.data || {};
    const toDate = (value: unknown) =>
      value ? new Date(String(value)) : null;
    try {
      await this.mirrorRepository.upsert(
        {
          id,
          rewardId: data.rewardId != null ? String(data.rewardId) : null,
          businessRewardId:
            data.businessRewardId != null
              ? String(data.businessRewardId)
              : null,
          rewardTitle: data.rewardTitle ?? null,
          issuerClientId: data.issuerClientId ?? null,
          recipientMcomUserId: data.recipient?.mcomUserId ?? null,
          recipientEmail: data.recipient?.email ?? null,
          rewardType: data.rewardType ?? null,
          code: data.code ?? null,
          mallReference: data.mallReference ?? null,
          status: data.status ?? 'ISSUED',
          value: Number(data.value ?? 0),
          quantity: Number(data.quantity ?? 1),
          expiresAt: toDate(data.expiresAt),
          redeemedAt: toDate(data.redeemedAt),
          revokedAt: toDate(data.revokedAt),
          metadata: data.metadata ?? null,
          lastEvent: {
            event,
            timestamp: payload.timestamp ?? new Date().toISOString(),
          },
        } as any,
        ['id'],
      );
    } catch (err: any) {
      // Never fail the event delivery because the mirror write failed.
      this.logger.warn(
        `Failed to upsert reward issuance mirror ${id}: ${err?.message || err}`,
      );
    }
  }
}
