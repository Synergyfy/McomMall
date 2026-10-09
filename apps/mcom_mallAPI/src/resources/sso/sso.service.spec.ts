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
    userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'merchant@store.com',
        firstName: 'Jane',
        lastName: 'Merchant',
        role: UserRole.OWNER,
      }),
      save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    userService = {
      create: jest.fn(),
    };

    const mockRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'existing-biz' }),
      create: jest.fn(),
      save: jest.fn(),
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
    };

    const MembershipEntity = require('../membership/entities/membership.entity').Membership;

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
