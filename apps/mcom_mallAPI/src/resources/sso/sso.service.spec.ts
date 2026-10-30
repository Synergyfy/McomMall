import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SsoService } from './sso.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/role.enum';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { McomCentralService } from './mcom-central.service';
import { PlatformEntitlement } from './platform-entitlement.interface';

describe('SsoService - Entitlement & Trial Integration', () => {
  let service: SsoService;
  let userRepository: Partial<Repository<User>>;
  let jwtService: Partial<JwtService>;
  let userService: Partial<UsersService>;
  let dataSource: Partial<DataSource>;
  let mcomCentralService: Partial<McomCentralService>;

  beforeEach(() => {
    jest.restoreAllMocks();
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });

    userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'merchant@store.com',
        firstName: 'Jane',
        lastName: 'Merchant',
        role: UserRole.OWNER,
      }),
      save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
      update: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    userService = {
      create: jest.fn(),
      findOrCreateFromCentralIdentity: jest
        .fn()
        .mockImplementation(() => userRepository.findOne({ where: {} })),
    };

    const mockRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'existing-biz' }),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };

    dataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    };

    mcomCentralService = {
      getIntrospectedEntitlement: jest.fn(),
      getUserPackages: jest.fn(),
    };

    service = new SsoService(
      userRepository as any,
      jwtService as any,
      userService as any,
      dataSource as any,
      mcomCentralService as any,
    );
  });

  it('grants access when user has PAID_MEMBERSHIP bundle including Mcom Mall', async () => {
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: true,
        accessType: 'PAID_MEMBERSHIP',
        upgradeUrl: 'http://localhost:3010/dashboard/memberships',
      },
      plan: {
        planId: 'mall-pro-vendor',
        planName: 'Vendor Pro Plan',
        source: 'membership',
        status: 'active',
        quotas: { productLimit: 100 },
        limits: {},
        features: ['featured_listing'],
      },
      membershipContext: {
        membershipPlanName: 'Gold',
        membershipLevel: 'Gold',
        membershipStatus: 'active',
        isIncludedInMembership: true,
      },
      trialContext: {
        isInTrial: false,
        hasPaidVerificationFee: false,
        trialExpiresAt: null,
        daysRemaining: 0,
        programmeTasks: [],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      entitlement,
      user: {
        id: 'usr_central_1',
        email: 'merchant@store.com',
        role: 'business',
        name: 'Jane Merchant',
      },
    };

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    const result = await service.handleCallbackFromCode('test-code');

    expect(result.accessType).toBe('PAID_MEMBERSHIP');
    expect(result.isTrial).toBe(false);
    expect(result.planId).toBe('mall-pro-vendor');
    expect(result.planName).toBe('Vendor Pro Plan');
    expect(result.quotas).toEqual({ productLimit: 100 });
  });

  it('syncs explicit first/last name and business name from Central', async () => {
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: true,
        accessType: 'PAID_MEMBERSHIP',
        upgradeUrl: 'http://localhost:3010/dashboard/memberships',
      },
      plan: {
        planId: 'mall-pro-vendor',
        planName: 'Vendor Pro Plan',
        source: 'membership',
        status: 'active',
        quotas: {},
        limits: {},
        features: [],
      },
      membershipContext: {
        membershipPlanName: 'Gold',
        membershipLevel: 'Gold',
        membershipStatus: 'active',
        isIncludedInMembership: true,
      },
      trialContext: {
        isInTrial: false,
        hasPaidVerificationFee: false,
        trialExpiresAt: null,
        daysRemaining: 0,
        programmeTasks: [],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      entitlement,
      user: {
        id: 'usr_central_sync',
        email: 'merchant@store.com',
        role: 'business',
        name: 'Acme Ltd',
        firstName: 'Alice',
        lastName: 'Smith',
        businessName: 'Acme Ltd',
      },
    };

    const businessRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'biz-1', businessName: 'Old Biz' }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const MembershipEntity =
      require('../membership/entities/membership.entity').Membership;

    dataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === MembershipEntity) {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      return businessRepo;
    });

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    const result = await service.handleCallbackFromCode('test-code');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        firstName: 'Alice',
        lastName: 'Smith',
        fullName: 'Alice Smith',
      }),
    );
    expect(businessRepo.update).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ businessName: 'Acme Ltd' }),
    );
    expect(result.name).toBe('Alice Smith');
  });

  it('does not overwrite local names when a legacy token has no explicit name claims', async () => {
    const entitlement = {
      access: { hasAccess: true, accessType: 'PAID_MEMBERSHIP' },
      plan: null,
      membershipContext: {},
      trialContext: { programmeTasks: [] },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      entitlement,
      user: {
        id: 'usr_central_legacy',
        email: 'merchant@store.com',
        role: 'business',
        name: 'Jane Merchant',
      },
    };

    const businessRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'biz-1', businessName: 'Jane Merchant' }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const MembershipEntity =
      require('../membership/entities/membership.entity').Membership;

    dataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === MembershipEntity) {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      return businessRepo;
    });

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    await service.handleCallbackFromCode('test-code');

    const nameUpdate = (userRepository.update as jest.Mock).mock.calls.find(
      ([, data]) => data && 'firstName' in data,
    );
    expect(nameUpdate).toBeUndefined();
    expect(businessRepo.update).not.toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ businessName: 'Jane Merchant' }),
    );
  });

  it('syncs full business and customer profile details from Central', async () => {
    const entitlement = {
      access: { hasAccess: true, accessType: 'PAID_MEMBERSHIP' },
      plan: null,
      membershipContext: {},
      trialContext: { programmeTasks: [] },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      entitlement,
      user: {
        id: 'usr_central_full',
        sub: 'usr_central_full',
        email: 'merchant@store.com',
        role: 'BUSINESS',
        profileType: 'BUSINESS',
        name: 'Acme Coffee',
        firstName: 'Jane',
        lastName: 'Doe',
        fullName: 'Jane Doe',
        jobTitle: 'Managing Director',
        phone: '+44 20 1234 5678',
        address: '1 High Street, London',
        postcode: 'EC1A 1BB',
        country: 'United Kingdom',
        avatarUrl: 'https://cdn.mcom.com/logo.png',
        businessId: 'biz_456',
        businessName: 'Acme Coffee',
        businessProfile: {
          id: 'biz_456',
          businessName: 'Acme Coffee',
          businessType: 'Limited Company',
          phone: '+44 20 1234 5678',
          email: 'hello@acmecoffee.co.uk',
          address: '1 High Street, London',
          postcode: 'EC1A 1BB',
          country: 'United Kingdom',
          industry: 'Food & Beverage',
          category: 'Coffee Shop',
          subCategory: 'Cafe',
          description: 'Speciality coffee roastery in central London.',
          website: 'https://acmecoffee.co.uk',
          logoUrl: 'https://cdn.mcom.com/logo.png',
          openingHours: 'Mon-Sat 8am-6pm',
          socialMedia: '{"instagram":"https://instagram.com/acmecoffee"}',
        },
      },
    };

    const businessRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'biz-1',
        businessName: 'Old Coffee',
        businessPhone: '+44 0000 000000',
        businessEmail: 'old@acmecoffee.co.uk',
        location: {
          id: 'loc-1',
          addressLine1: 'Old Street',
          postcode: 'OLD 1AA',
          countryCode: 'GB',
        },
      }),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockImplementation((value) => Promise.resolve(value)),
    };
    const socialRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const MembershipEntity =
      require('../membership/entities/membership.entity').Membership;

    dataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === MembershipEntity) {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      if (entity?.name === 'SocialLink') return socialRepo;
      return businessRepo;
    });

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    await service.handleCallbackFromCode('test-code');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        lastName: 'Doe',
        fullName: 'Jane Doe',
        jobTitle: 'Managing Director',
        address: '1 High Street, London',
        postcode: 'EC1A 1BB',
        country: 'United Kingdom',
        profilePictureUrl: 'https://cdn.mcom.com/logo.png',
      }),
    );
    expect(businessRepo.update).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({
        businessName: 'Acme Coffee',
        businessType: 'Limited Company',
        industry: 'Food & Beverage',
        centralCategory: 'Coffee Shop',
        centralSubCategory: 'Cafe',
        website: 'https://acmecoffee.co.uk',
        openingHours: 'Mon-Sat 8am-6pm',
      }),
    );
    expect(socialRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'instagram',
        url: 'https://instagram.com/acmecoffee',
      }),
    );
  });

  it('grants access when user is on TRIAL_PROGRAMME with active tasks', async () => {
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: true,
        accessType: 'TRIAL_PROGRAMME',
        upgradeUrl: 'http://localhost:3010/dashboard/memberships',
      },
      plan: {
        planId: 'trial_mall',
        planName: 'Programme Trial Access',
        source: 'trial',
        status: 'trial',
        quotas: { trialAccess: true, daysRemaining: 14 },
        limits: {},
        features: [],
      },
      membershipContext: {
        membershipPlanName: null,
        membershipLevel: 'Bronze',
        membershipStatus: 'trial',
        isIncludedInMembership: false,
      },
      trialContext: {
        isInTrial: true,
        hasPaidVerificationFee: true,
        trialExpiresAt: '2026-10-23T00:00:00.000Z',
        daysRemaining: 14,
        programmeTasks: [
          {
            taskId: 'task_onboarding_1',
            title: 'Complete Mall Storefront Profile',
            description: 'Set up business details in MCOM Mall',
            deadlineDays: 7,
            rewardPoints: 50,
            status: 'PENDING',
          },
        ],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      entitlement,
      user: {
        id: 'usr_central_trial',
        email: 'trial@store.com',
        role: 'business',
        name: 'Trial Merchant',
      },
    };

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    const result = await service.handleCallbackFromCode('test-code');

    expect(result.accessType).toBe('TRIAL_PROGRAMME');
    expect(result.isTrial).toBe(true);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].taskId).toBe('task_onboarding_1');
  });

  it('denies access with UNVERIFIED reason when verification fee is unpaid', async () => {
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: false,
        accessType: 'NONE',
        reason: 'UNVERIFIED',
        upgradeUrl: 'http://localhost:3010/dashboard?action=verify',
      },
      plan: null,
      membershipContext: {
        membershipPlanName: null,
        membershipLevel: 'Bronze',
        membershipStatus: 'trial',
        isIncludedInMembership: false,
      },
      trialContext: {
        isInTrial: false,
        hasPaidVerificationFee: false,
        trialExpiresAt: null,
        daysRemaining: 0,
        programmeTasks: [],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      entitlement,
      user: {
        id: 'usr_unverified',
        email: 'unverified@store.com',
        role: 'business',
      },
    };

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    try {
      await service.handleCallbackFromCode('test-code');
      fail('Expected ForbiddenException');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ForbiddenException);
      const res = err.getResponse();
      expect(res.reason).toBe('UNVERIFIED');
      expect(res.upgradeUrl).toContain('action=verify');
    }
  });

  it('denies access with PLATFORM_NOT_IN_MEMBERSHIP when tier excludes Mall', async () => {
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: false,
        accessType: 'NONE',
        reason: 'PLATFORM_NOT_IN_MEMBERSHIP',
        upgradeUrl: 'http://localhost:3010/dashboard/memberships',
      },
      plan: null,
      membershipContext: {
        membershipPlanName: 'Bronze',
        membershipLevel: 'Bronze',
        membershipStatus: 'active',
        isIncludedInMembership: false,
      },
      trialContext: {
        isInTrial: false,
        hasPaidVerificationFee: false,
        trialExpiresAt: null,
        daysRemaining: 0,
        programmeTasks: [],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      entitlement,
      user: {
        id: 'usr_bronze',
        email: 'bronze@store.com',
        role: 'business',
      },
    };

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    try {
      await service.handleCallbackFromCode('test-code');
      fail('Expected ForbiddenException');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ForbiddenException);
      const res = err.getResponse();
      expect(res.reason).toBe('PLATFORM_NOT_IN_MEMBERSHIP');
      expect(res.upgradeUrl).toContain('/dashboard/memberships');
    }
  });

  it('denies access with TRIAL_NO_TASKS when trial merchant has no Mall tasks', async () => {
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: false,
        accessType: 'NONE',
        reason: 'TRIAL_NO_TASKS',
        upgradeUrl: 'http://localhost:3010/dashboard/memberships',
      },
      plan: null,
      membershipContext: {
        membershipPlanName: null,
        membershipLevel: 'Bronze',
        membershipStatus: 'trial',
        isIncludedInMembership: false,
      },
      trialContext: {
        isInTrial: true,
        hasPaidVerificationFee: true,
        trialExpiresAt: '2026-10-23T00:00:00.000Z',
        daysRemaining: 14,
        programmeTasks: [],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      entitlement,
      user: {
        id: 'usr_no_tasks',
        email: 'notasks@store.com',
        role: 'business',
      },
    };

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    try {
      await service.handleCallbackFromCode('test-code');
      fail('Expected ForbiddenException');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ForbiddenException);
      const res = err.getResponse();
      expect(res.reason).toBe('TRIAL_NO_TASKS');
    }
  });

  it('allows non-business customer users without requiring a subscription', async () => {
    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      user: {
        id: 'usr_customer_1',
        email: 'shopper@consumer.com',
        role: 'customer',
        name: 'Sam Shopper',
      },
    };

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    const result = await service.handleCallbackFromCode('test-code');

    expect(result.role).toBe(UserRole.CUSTOMER);
    expect(result.userId).toBe('user-123');
  });

  it('grants access when user does NOT have a central membership but has an active direct MCOM Mall plan', async () => {
    // Central returns access denied because no global Central membership exists
    const entitlement: PlatformEntitlement = {
      version: '2026-10-01',
      targetPlatform: {
        clientId: 'mcom-mall',
        platformSlug: 'mall',
        name: 'MCOM Mall',
      },
      access: {
        hasAccess: false,
        accessType: 'NONE',
        reason: 'PLATFORM_NOT_IN_MEMBERSHIP',
        upgradeUrl: 'http://localhost:3010/dashboard/memberships',
      },
      plan: null,
      membershipContext: {
        membershipPlanName: null,
        membershipLevel: 'Bronze',
        membershipStatus: 'active',
        isIncludedInMembership: false,
      },
      trialContext: {
        isInTrial: false,
        hasPaidVerificationFee: false,
        trialExpiresAt: null,
        daysRemaining: 0,
        programmeTasks: [],
      },
    };

    const tokenData = {
      accessToken: 'sso-access-token',
      refreshToken: 'sso-refresh-token',
      entitlement,
      user: {
        id: 'usr_central_direct',
        email: 'merchant@store.com',
        role: 'business',
        name: 'Jane Merchant',
      },
    };

    // Mock local membership in MCOM Mall DB as active
    const membershipMockRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'local-mem-1',
        isActive: true,
        planVariantId: 'mall-pro-yearly',
        planType: 'annual',
        expiresAt: new Date(Date.now() + 86400000),
      }),
    };

    const businessMockRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'existing-biz' }),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const MembershipEntity =
      require('../membership/entities/membership.entity').Membership;

    dataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === MembershipEntity) return membershipMockRepo;
      return businessMockRepo;
    });

    jest.spyOn(service, 'exchangeCode').mockResolvedValue(tokenData);

    const result = await service.handleCallbackFromCode('test-code');

    expect(result.accessType).toBe('DIRECT_PACKAGE');
    expect(result.planId).toBe('mall-pro-yearly');
    expect(result.planName).toBe('MCOM Mall Direct Plan');
    expect(result.isTrial).toBe(false);
  });
});
