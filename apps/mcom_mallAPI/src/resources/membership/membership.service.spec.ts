import { MembershipService } from './membership.service';

const NOW = Date.now();
const FUTURE = new Date(NOW + 30 * 24 * 60 * 60 * 1000);
const PAST = new Date(NOW - 24 * 60 * 60 * 1000);

function localMembership(overrides: Record<string, any> = {}) {
  return {
    id: 'local-membership',
    isActive: true,
    isTrial: false,
    expiresAt: FUTURE,
    renewalMethod: 'mcom_wallet',
    planVariantId: 'local-variant',
    startDate: PAST,
    endDate: FUTURE,
    ...overrides,
  };
}

function centralGrant(overrides: Record<string, any> = {}) {
  return {
    id: 'central-grant',
    userId: 'user-1',
    isActive: true,
    status: 'active',
    expiresAt: FUTURE,
    planVariantId: 'central-variant',
    planType: 'annual',
    created_at: PAST,
    ...overrides,
  };
}

describe('MembershipService entitlement precedence', () => {
  let service: MembershipService;
  let membershipRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let centralGrantRepo: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    membershipRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn((value) => Promise.resolve(value)),
    };
    centralGrantRepo = { findOne: jest.fn().mockResolvedValue(null) };

    service = new MembershipService(
      membershipRepo as any,
      centralGrantRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('uses a direct Mall plan while it is active, even with a CHS grant', async () => {
    membershipRepo.findOne.mockResolvedValue(localMembership());
    centralGrantRepo.findOne.mockResolvedValue(centralGrant());

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective?.source).toBe('local');
    expect(effective?.membership.planVariantId).toBe('local-variant');
  });

  it('falls back to the CHS grant when the direct Mall plan has expired', async () => {
    membershipRepo.findOne.mockResolvedValue(
      localMembership({ expiresAt: PAST }),
    );
    centralGrantRepo.findOne.mockResolvedValue(centralGrant());

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective?.source).toBe('central');
    expect(effective?.membership.planVariantId).toBe('central-variant');
  });

  it('uses the CHS grant when there is no Mall membership row', async () => {
    centralGrantRepo.findOne.mockResolvedValue(centralGrant());

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective?.source).toBe('central');
  });

  it('prefers the CHS grant over a local trial', async () => {
    membershipRepo.findOne.mockResolvedValue(
      localMembership({ isTrial: true, renewalMethod: 'trial' }),
    );
    centralGrantRepo.findOne.mockResolvedValue(centralGrant());

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective?.source).toBe('central');
  });

  it('uses an active trial when no paid plan or CHS grant exists', async () => {
    membershipRepo.findOne.mockResolvedValue(
      localMembership({ isTrial: true, renewalMethod: 'trial' }),
    );

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective?.source).toBe('trial');
  });

  it('treats a legacy Central row as Central, not as a Mall purchase', async () => {
    membershipRepo.findOne.mockResolvedValue(
      localMembership({ renewalMethod: 'central_membership' }),
    );

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective?.source).toBe('central');
  });

  it('ignores an expired CHS grant', async () => {
    centralGrantRepo.findOne.mockResolvedValue(
      centralGrant({ expiresAt: PAST }),
    );

    const effective = await service.resolveEffectiveMembership('user-1');

    expect(effective).toBeNull();
  });

  it('returns null when no source grants access', async () => {
    const effective = await service.resolveEffectiveMembership('user-1');
    expect(effective).toBeNull();
  });
});
