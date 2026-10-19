import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ServiceMeshService } from '../service-mesh/services/service-mesh.service';
import {
  SERVICE_SCOPE_REWARDS_ISSUE,
  SERVICE_SCOPE_REWARDS_READ,
} from '../service-mesh/constants';
import {
  PaginatedIssuances,
  RewardIssuanceDto,
} from './interfaces/reward-issuance.interface';

export interface ReserveIssuanceInput {
  orderRef: string;
  idempotencyKey: string;
  /** Optional metadata echoed back to rewards for audit. */
  metadata?: Record<string, any>;
}

export interface CommitIssuanceInput {
  orderRef: string;
  note?: string;
}

export interface ReleaseIssuanceInput {
  orderRef: string;
  reason?: string;
}

/**
 * Outbound client for the MCOM Rewards partner API over the zero-hop service
 * mesh. Every call mints/caches a short-lived RS256 service token and hits the
 * rewards backend DIRECTLY — MCOM Central is never in the data path.
 */
@Injectable()
export class RewardsClientService {
  private readonly logger = new Logger(RewardsClientService.name);

  constructor(private readonly mesh: ServiceMeshService) {}

  isEnabled(): boolean {
    return this.mesh.isEnabled();
  }

  private get rewardsClientId(): string {
    return this.mesh.getRewardsClientId();
  }

  private assertEnabled(): void {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException(
        'MCOM Rewards integration is disabled (MCOM_REWARDS_MESH_ENABLED=false)',
      );
    }
  }

  private path(suffix: string): string {
    return `/api/v1/partner/issuances${suffix}`;
  }

  /**
   * List a user's reward issuances. Requires the rewards peer to permit
   * recipient-scoped listing by non-issuer peers (see partner contract).
   */
  async listUserIssuances(
    centralUserId: string,
    params: { status?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedIssuances> {
    this.assertEnabled();
    const qs = new URLSearchParams();
    qs.set('recipientMcomUserId', centralUserId);
    if (params.status) qs.set('status', params.status);
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 100));

    return this.mesh.callPeerByClientId<PaginatedIssuances>(
      this.rewardsClientId,
      `${this.path('')}?${qs.toString()}`,
      { method: 'GET', timeout: 8000 },
      SERVICE_SCOPE_REWARDS_READ,
    );
  }

  async getIssuance(id: string): Promise<RewardIssuanceDto> {
    this.assertEnabled();
    return this.mesh.callPeerByClientId<RewardIssuanceDto>(
      this.rewardsClientId,
      this.path(`/${encodeURIComponent(id)}`),
      { method: 'GET', timeout: 8000 },
      SERVICE_SCOPE_REWARDS_READ,
    );
  }

  /** Atomically reserve an issuance for a checkout attempt (ISSUED→RESERVED). */
  async reserveIssuance(
    id: string,
    input: ReserveIssuanceInput,
  ): Promise<RewardIssuanceDto> {
    this.assertEnabled();
    return this.mesh.callPeerByClientId<RewardIssuanceDto>(
      this.rewardsClientId,
      this.path(`/${encodeURIComponent(id)}/reserve`),
      {
        method: 'POST',
        timeout: 10000,
        data: {
          orderRef: input.orderRef,
          idempotencyKey: input.idempotencyKey,
          metadata: input.metadata,
        },
      },
      SERVICE_SCOPE_REWARDS_ISSUE,
    );
  }

  /** Commit a reservation after successful payment (RESERVED→REDEEMED). */
  async commitIssuance(
    id: string,
    input: CommitIssuanceInput,
  ): Promise<RewardIssuanceDto> {
    this.assertEnabled();
    return this.mesh.callPeerByClientId<RewardIssuanceDto>(
      this.rewardsClientId,
      this.path(`/${encodeURIComponent(id)}/commit`),
      {
        method: 'POST',
        timeout: 10000,
        data: { orderRef: input.orderRef, note: input.note },
      },
      SERVICE_SCOPE_REWARDS_ISSUE,
    );
  }

  /** Release a reservation on failed payment/expiry (RESERVED→ISSUED). */
  async releaseIssuance(
    id: string,
    input: ReleaseIssuanceInput,
  ): Promise<RewardIssuanceDto> {
    this.assertEnabled();
    return this.mesh.callPeerByClientId<RewardIssuanceDto>(
      this.rewardsClientId,
      this.path(`/${encodeURIComponent(id)}/release`),
      {
        method: 'POST',
        timeout: 10000,
        data: { orderRef: input.orderRef, reason: input.reason },
      },
      SERVICE_SCOPE_REWARDS_ISSUE,
    );
  }

  /** Mark a code-based issuance redeemed (e.g. a reward voucher used in mall). */
  async redeemIssuance(
    id: string,
    input: { code?: string; note?: string },
  ): Promise<RewardIssuanceDto> {
    this.assertEnabled();
    return this.mesh.callPeerByClientId<RewardIssuanceDto>(
      this.rewardsClientId,
      this.path(`/${encodeURIComponent(id)}/redeem`),
      {
        method: 'POST',
        timeout: 10000,
        data: { code: input.code, note: input.note },
      },
      SERVICE_SCOPE_REWARDS_ISSUE,
    );
  }

  /**
   * Best-effort helper: never throws. Returns null when the peer is
   * unavailable, so read paths can degrade gracefully.
   */
  async tryListUserIssuances(
    centralUserId: string,
    params: { status?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedIssuances | null> {
    if (!this.isEnabled()) return null;
    try {
      return await this.listUserIssuances(centralUserId, params);
    } catch (err) {
      this.logger.warn(
        `Failed to list rewards issuances for ${centralUserId}: ${(err as Error).message}`,
      );
      return null;
    }
  }
}
