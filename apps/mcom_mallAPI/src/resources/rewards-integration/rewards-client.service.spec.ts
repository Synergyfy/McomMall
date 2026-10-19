import { ServiceUnavailableException } from '@nestjs/common';
import { RewardsClientService } from './rewards-client.service';
import {
  SERVICE_SCOPE_REWARDS_ISSUE,
  SERVICE_SCOPE_REWARDS_READ,
} from '../service-mesh/constants';

function makeMesh(enabled = true) {
  return {
    isEnabled: jest.fn().mockReturnValue(enabled),
    getRewardsClientId: jest.fn().mockReturnValue('mcom-rewards'),
    callPeerByClientId: jest.fn().mockResolvedValue({ ok: true }),
  };
}

describe('RewardsClientService', () => {
  it('lists a user issuances with recipient scope and rewards:read', async () => {
    const mesh = makeMesh();
    const service = new RewardsClientService(mesh as any);

    mesh.callPeerByClientId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    });

    await service.listUserIssuances('central-user-1', { status: 'ISSUED' });

    const [clientId, path, options, scope] =
      mesh.callPeerByClientId.mock.calls[0];
    expect(clientId).toBe('mcom-rewards');
    expect(path).toContain('/api/v1/partner/issuances?');
    expect(path).toContain('recipientMcomUserId=central-user-1');
    expect(path).toContain('status=ISSUED');
    expect(path).toContain('limit=100');
    expect(options.method).toBe('GET');
    expect(scope).toBe(SERVICE_SCOPE_REWARDS_READ);
  });

  it('reserves an issuance idempotently with rewards:issue', async () => {
    const mesh = makeMesh();
    const service = new RewardsClientService(mesh as any);

    await service.reserveIssuance('issuance-1', {
      orderRef: 'mall-order-1',
      idempotencyKey: 'mall-order-1:issuance-1',
      metadata: { discountAmount: 10 },
    });

    const [clientId, path, options, scope] =
      mesh.callPeerByClientId.mock.calls[0];
    expect(clientId).toBe('mcom-rewards');
    expect(path).toBe('/api/v1/partner/issuances/issuance-1/reserve');
    expect(options.method).toBe('POST');
    expect(options.data).toEqual({
      orderRef: 'mall-order-1',
      idempotencyKey: 'mall-order-1:issuance-1',
      metadata: { discountAmount: 10 },
    });
    expect(scope).toBe(SERVICE_SCOPE_REWARDS_ISSUE);
  });

  it('commits and releases reservations', async () => {
    const mesh = makeMesh();
    const service = new RewardsClientService(mesh as any);

    await service.commitIssuance('issuance-1', { orderRef: 'mall-order-1' });
    await service.releaseIssuance('issuance-1', {
      orderRef: 'mall-order-1',
      reason: 'payment_failed',
    });

    expect(mesh.callPeerByClientId.mock.calls[0][1]).toBe(
      '/api/v1/partner/issuances/issuance-1/commit',
    );
    expect(mesh.callPeerByClientId.mock.calls[0][2].data).toEqual({
      orderRef: 'mall-order-1',
      note: undefined,
    });
    expect(mesh.callPeerByClientId.mock.calls[1][1]).toBe(
      '/api/v1/partner/issuances/issuance-1/release',
    );
    expect(mesh.callPeerByClientId.mock.calls[1][2].data).toEqual({
      orderRef: 'mall-order-1',
      reason: 'payment_failed',
    });
  });

  it('fails fast when the integration is disabled', async () => {
    const mesh = makeMesh(false);
    const service = new RewardsClientService(mesh as any);

    await expect(service.listUserIssuances('u1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(mesh.callPeerByClientId).not.toHaveBeenCalled();
  });

  it('degrades gracefully in tryListUserIssuances', async () => {
    const mesh = makeMesh();
    const service = new RewardsClientService(mesh as any);
    mesh.callPeerByClientId.mockRejectedValue(new Error('peer down'));

    await expect(service.tryListUserIssuances('u1')).resolves.toBeNull();
  });
});
