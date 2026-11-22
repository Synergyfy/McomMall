import { ServiceUnavailableException } from '@nestjs/common';
import { MembershipSyncService } from './membership-sync.service';
import { PlanExpiryService } from '../plans/services/plan-expiry.service';

const EXPIRES_AT = '2027-11-22T00:00:00.000Z';

const PAYLOAD = {
  event: 'membership.updated',
  platform: 'mall',
  timestamp: '2026-11-22T10:15:00.000Z',
  data: {
    eventId: 'evt_1',
    occurredAt: '2026-11-22T10:15:00.000Z',
    userId: 'usr_1',
    businessId: 'biz_1',
    membership: {
      planId: 'plan_gold',
      planName: 'Gold',
      tier: 'Pro+',
      level: 'Gold',
      status: 'active',
      billingCycle: 'Annually',
      amount: 249,
      currency: 'GBP',
      startsAt: null,
      expiresAt: EXPIRES_AT,
    },
    package: {
      platform: 'MCOM Mall',
      packageName: 'Mall Pro+',
      externalPlanId: 'mall-pro-plus',
      status: 'active',
      limits: { listings: 500 },
      expiresAt: EXPIRES_AT,
    },
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

describe('MembershipSyncService', () => {
  let service: MembershipSyncService;
  let eventsRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let usersRepo: { findOne: jest.Mock };
  let membershipsRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let grantsRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let variantsRepo: { findOne: jest.Mock };
  let plansRepo: { findOne: jest.Mock; find: jest.Mock };
  let profileSync: { syncProfileFromCentral: jest.Mock };
  let configValues: Record<string, string | undefined>;

  const user = { id: 'local-1', centralUserId: 'usr_1' };
  const variant = {
    id: 'variant-1',
    isActive: true,
    externalPlanId: 'mall-pro-plus',
    tierLevel: { name: 'PRO_PLUS', sortOrder: 3, isCalendarYear: true },
    plan: { id: 'plan-1', name: 'Gold', slug: 'gold' },
  };

  beforeEach(() => {
    configValues = {};
    eventsRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn((value) =>
        Promise.resolve({
          ...value,
          id: 'row-1',
          updated_at: new Date(),
        }),
      ),
      update: jest.fn().mockResolvedValue({}),
    };
    usersRepo = { findOne: jest.fn().mockResolvedValue(user) };
    membershipsRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value ?? {}),
      save: jest.fn((value) =>
        Promise.resolve({ ...value, id: 'membership-1' }),
      ),
    };
    grantsRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value ?? {}),
      save: jest.fn((value) => Promise.resolve({ ...value, id: 'grant-1' })),
    };
    variantsRepo = { findOne: jest.fn().mockResolvedValue(variant) };
    plansRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
    };
    profileSync = { syncProfileFromCentral: jest.fn().mockResolvedValue({}) };

    service = new MembershipSyncService(
      eventsRepo as any,
      usersRepo as any,
      membershipsRepo as any,
      grantsRepo as any,
      variantsRepo as any,
      plansRepo as any,
      profileSync as any,
      new PlanExpiryService(),
      {
        get: jest.fn((key: string) => configValues[key]),
      } as any,
    );
  });

  it('maps the bundled package and activates the local membership until Central expiry', async () => {
    const result = await service.handleIncomingEvent(clone(PAYLOAD));

    expect(variantsRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ externalPlanId: expect.anything() }),
      }),
    );
    expect(membershipsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        planVariantId: 'variant-1',
        isActive: true,
        autoRenew: false,
        renewalMethod: 'central_membership',
        nextChargeAt: null,
        expiresAt: new Date(EXPIRES_AT),
      }),
    );
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'completed' }),
    );
    expect(result).toMatchObject({
      duplicate: false,
      applied: {
        action: 'activated',
        localUserId: 'local-1',
        planVariantId: 'variant-1',
        expiresAt: new Date(EXPIRES_AT).toISOString(),
      },
    });
  });

  it('revokes access for an expired membership', async () => {
    const payload = clone(PAYLOAD);
    payload.data.membership.status = 'expired';
    payload.data.package.status = 'expired';

    const existing = {
      id: 'membership-1',
      isActive: true,
      planVariantId: 'variant-1',
      expiresAt: new Date(EXPIRES_AT),
      renewalStatus: 'active',
      renewalMethod: 'central_membership',
    };
    membershipsRepo.findOne.mockResolvedValue(existing);

    const result = await service.handleIncomingEvent(payload);

    expect(membershipsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: false,
        renewalStatus: 'expired',
        autoRenew: false,
        nextChargeAt: null,
      }),
    );
    expect(result).toMatchObject({ applied: { action: 'revoked' } });
  });

  it('does not revoke a locally purchased membership on a Central expiry', async () => {
    const payload = clone(PAYLOAD);
    payload.data.membership.status = 'expired';
    payload.data.package.status = 'expired';

    membershipsRepo.findOne.mockResolvedValue({
      id: 'membership-1',
      isActive: true,
      planVariantId: 'variant-1',
      expiresAt: new Date(EXPIRES_AT),
      renewalStatus: 'active',
      renewalMethod: 'mcom_wallet',
    });

    const result = await service.handleIncomingEvent(payload);

    expect(membershipsRepo.save).not.toHaveBeenCalled();
    expect(result).toMatchObject({ applied: { action: 'unchanged' } });
  });

  it('stores a CHS grant without overwriting a Mall-owned plan', async () => {
    membershipsRepo.findOne.mockResolvedValue({
      id: 'membership-1',
      isActive: true,
      planVariantId: 'local-variant',
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
      renewalStatus: 'active',
      renewalMethod: 'mcom_wallet',
    });

    const result = await service.handleIncomingEvent(clone(PAYLOAD));

    // The direct Mall plan is left untouched; the CHS entitlement is kept
    // alongside it and becomes active when the Mall plan expires.
    expect(membershipsRepo.save).not.toHaveBeenCalled();
    expect(grantsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'local-1',
        centralUserId: 'usr_1',
        planVariantId: 'variant-1',
        isActive: true,
        expiresAt: new Date(EXPIRES_AT),
      }),
    );
    expect(result).toMatchObject({
      applied: { action: 'activated', planVariantId: 'variant-1' },
    });
  });

  it('revokes a stored grant even when no Central membership row exists', async () => {
    const payload = clone(PAYLOAD);
    payload.data.membership.status = 'cancelled';

    grantsRepo.findOne.mockResolvedValue({
      id: 'grant-1',
      userId: 'local-1',
      planVariantId: 'variant-1',
      isActive: true,
      status: 'active',
      expiresAt: new Date(EXPIRES_AT),
    });

    const result = await service.handleIncomingEvent(payload);

    expect(grantsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false, status: 'cancelled' }),
    );
    expect(membershipsRepo.save).not.toHaveBeenCalled();
    expect(result).toMatchObject({ applied: { action: 'revoked' } });
  });

  it('acknowledges a duplicate delivery without re-applying it', async () => {
    eventsRepo.findOne.mockResolvedValue({
      id: 'row-1',
      status: 'completed',
      updated_at: new Date(),
    });

    const result = await service.handleIncomingEvent(clone(PAYLOAD));

    expect(result.duplicate).toBe(true);
    expect(membershipsRepo.save).not.toHaveBeenCalled();
  });

  it('ignores events it does not own', async () => {
    const result = await service.handleIncomingEvent({
      event: 'package.created',
      data: { userId: 'usr_1' },
    });

    expect(result).toMatchObject({
      ignored: true,
      reason: 'unsupported_event',
    });
    expect(eventsRepo.save).not.toHaveBeenCalled();
  });

  it('asks Central to retry when the package cannot be mapped', async () => {
    variantsRepo.findOne.mockResolvedValue(null);
    plansRepo.findOne.mockResolvedValue(null);
    plansRepo.find.mockResolvedValue([]);

    await expect(
      service.handleIncomingEvent(clone(PAYLOAD)),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(membershipsRepo.save).not.toHaveBeenCalled();
    expect(eventsRepo.update).toHaveBeenCalledWith(
      'row-1',
      expect.objectContaining({ status: 'failed' }),
    );
  });

  it('provisions the local account from Central when the user is new', async () => {
    usersRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(user);

    const result = await service.handleIncomingEvent(clone(PAYLOAD));

    expect(profileSync.syncProfileFromCentral).toHaveBeenCalledWith('usr_1');
    expect(result).toMatchObject({ applied: { action: 'activated' } });
  });

  it('skips when Central provides no user id', async () => {
    await expect(
      service.handleIncomingEvent({
        event: 'membership.updated',
        data: { eventId: 'evt_1' },
      }),
    ).rejects.toThrow('data.userId');
  });

  it('honours MCOM_MEMBERSHIP_PLAN_MAP overrides', async () => {
    const overrideVariant = {
      ...variant,
      id: '22222222-2222-4222-8222-222222222222',
    };
    variantsRepo.findOne.mockResolvedValue(overrideVariant);
    configValues.MCOM_MEMBERSHIP_PLAN_MAP = JSON.stringify({
      'mall-pro-plus': overrideVariant.id,
    });

    const result = await service.handleIncomingEvent(clone(PAYLOAD));

    expect(result).toMatchObject({
      applied: { planVariantId: overrideVariant.id },
    });
  });
});
