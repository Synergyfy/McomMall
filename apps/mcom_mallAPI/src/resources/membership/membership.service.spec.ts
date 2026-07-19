import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { Membership } from './entities/membership.entity';
import { User } from '../users/entities/user.entity';
import { MembershipTier } from './membership-tier.enum';
import { UserRole } from '../../common/role.enum';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { MembershipPayment } from './entities/membership-payment.entity';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import {
  InitiateMembershipPaymentDto,
  PlanType,
} from './dto/initiate-membership-payment.dto';
import { VerifyMembershipPaymentDto } from './dto/verify-membership-payment.dto';
import { Tier } from '../tier/entities/tier.entity';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { TierType } from '../tier/enums/tier-type.enum';
import { DataSource } from 'typeorm';
import { McomCentralService } from '../sso/mcom-central.service';

describe('MembershipService', () => {
  let service: MembershipService;

  const mockMembershipRepository = {
    create: jest.fn().mockImplementation((dto) => ({ ...dto })),
    save: jest.fn().mockImplementation((m) => Promise.resolve(m)),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    findOne: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((p) => Promise.resolve(p)),
  };

  const mockTierRepository = {
    findOne: jest.fn(),
  };

  const mockCentralIntegrationService = {
    processCashback: jest.fn(),
  };

  const mockPaymentProviderService = {
    createStripePaymentIntent: jest.fn(),
    createPaypalOrder: jest.fn(),
    verifyStripePaymentIntent: jest.fn(),
    captureAndVerifyPaypalOrder: jest.fn(),
  };

  const mockMcomCentralService = {
    getUserPackages: jest.fn(),
    getUserContext: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback) => {
      const mockEntityManager = {
        getRepository: (entity) => {
          if (entity === Membership) return mockMembershipRepository;
          if (entity === User) return mockUserRepository;
          if (entity === MembershipPayment) return mockPaymentRepository;
          if (entity === Tier) return mockTierRepository;
        },
      };
      return callback(mockEntityManager);
    }),
  };

  const user = {
    id: 'user-id-1',
    role: UserRole.OWNER,
    email: 'test@example.com',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: getRepositoryToken(Membership),
          useValue: mockMembershipRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(MembershipPayment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(Tier),
          useValue: mockTierRepository,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        {
          provide: CentralIntegrationService,
          useValue: mockCentralIntegrationService,
        },
        {
          provide: McomCentralService,
          useValue: mockMcomCentralService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateMembershipPayment', () => {
    const initiateDto: InitiateMembershipPaymentDto = {
      tierId: 'tier-id-1',
      paymentProvider: PaymentMethod.STRIPE,
    };

    it('should throw ConflictException if user already has an active membership', async () => {
      mockMembershipRepository.findOne.mockResolvedValue({ isActive: true });
      await expect(
        service.initiateMembershipPayment(initiateDto, user),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyAndCreateMembership with Seasonal Tier', () => {
    it('should use season dates for membership when tier is seasonal', async () => {
      const season = {
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
      };
      const seasonalTier = { id: 'tier-1', type: TierType.SEASONAL, season };

      const verifyDto: VerifyMembershipPaymentDto = {
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
        purchaseDetails: { tierId: 'tier-1', planType: PlanType.MONTHLY },
      };

      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockTierRepository.findOne.mockResolvedValue(seasonalTier);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({
        ok: true,
      });
      mockMembershipRepository.create.mockImplementation((dto) => dto);
      mockMembershipRepository.save.mockImplementation((m) =>
        Promise.resolve(m),
      );

      const result = await service.verifyAndCreateMembership(verifyDto, user);

      expect(result.startDate).toEqual(season.startDate);
      expect(result.endDate).toEqual(season.endDate);
    });
  });

  describe('ensureDates', () => {
    it('should backfill dates for existing membership', async () => {
      const membership: any = {
        id: 'mem-1',
        created_at: new Date('2026-01-01'),
        expiresAt: new Date('2026-02-01'),
      };

      await (service as any).ensureDates(membership);

      expect(membership.startDate).toEqual(membership.created_at);
      expect(membership.endDate).toEqual(membership.expiresAt);
    });
  });

  describe('getMembershipPrice', () => {
    it('should return the correct price for a tier', () => {
      expect(service.getMembershipPrice(MembershipTier.BASIC)).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return membership with tier data from local DB when tierId is provided', async () => {
      const mockTier = {
        id: 'tier-uuid-123',
        name: 'Gold Plan',
        description: 'Premium features',
        monthlyPrice: 29.99,
        quarterlyPrice: 79.99,
        annualPrice: 299.99,
        features: ['Priority support', 'Advanced analytics'],
        configuration: { quotas: { maxListings: 50 } },
        isActive: true,
      };

      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-uuid-123',
        isActive: true,
        packages: [{ platform: 'MCOM Mall', status: 'active' }],
      });

      mockTierRepository.findOne.mockResolvedValue(mockTier);

      const testUser = { id: 'user-1', centralUserId: 'central-1' } as User;
      const result = await service.findOne(testUser);

      expect(result).toEqual({
        id: 'subscription-user-1',
        isActive: true,
        tierId: 'tier-uuid-123',
        tier: {
          id: 'tier-uuid-123',
          name: 'Gold Plan',
          description: 'Premium features',
          monthlyPrice: 29.99,
          quarterlyPrice: 79.99,
          annualPrice: 299.99,
          features: ['Priority support', 'Advanced analytics'],
          configuration: { quotas: { maxListings: 50 } },
          isActive: true,
        },
        planType: null,
        startDate: null,
        expiresAt: null,
        endDate: null,
        isTrial: false,
        trialDuration: 0,
        packages: [{ platform: 'MCOM Mall', status: 'active' }],
      });
    });

    it('should return null when no active package from Mcom Solutions', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: null,
        isActive: false,
        packages: [],
      });

      const testUser = { id: 'user-2', centralUserId: 'central-2' } as User;
      const result = await service.findOne(testUser);

      expect(result).toBeNull();
    });

    it('should return null when McomCentralService returns null', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue(null);

      const testUser = { id: 'user-3', centralUserId: 'central-3' } as User;
      const result = await service.findOne(testUser);

      expect(result).toBeNull();
    });

    it('should return null when tierId exists but tier not found in local DB', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'nonexistent-tier',
        isActive: true,
        packages: [{ platform: 'MCOM Mall', status: 'active' }],
      });

      mockTierRepository.findOne.mockResolvedValue(null);

      const testUser = { id: 'user-4', centralUserId: 'central-4' } as User;
      const result = await service.findOne(testUser);

      expect(result).toBeNull();
    });

    it('should call getUserPackages with centralUserId when available', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-1',
        isActive: true,
        packages: [],
      });
      mockTierRepository.findOne.mockResolvedValue({ id: 'tier-1', name: 'Basic' });

      const testUser = { id: 'user-5', centralUserId: 'central-5' } as User;
      await service.findOne(testUser);

      expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledWith('central-5');
    });

    it('should fallback to query database when centralUserId is missing on input user object', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-5b',
        centralUserId: 'central-5b',
      });
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-1',
        isActive: true,
        packages: [],
      });
      mockTierRepository.findOne.mockResolvedValue({
        id: 'tier-1',
        name: 'Basic',
      });

      const testUser = { id: 'user-5b', centralUserId: null } as User;
      await service.findOne(testUser);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-5b' },
      });
      expect(mockMcomCentralService.getUserPackages).toHaveBeenCalledWith(
        'central-5b',
      );
    });

    it('should throw BadRequestException if centralUserId is completely missing in database', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const testUser = { id: 'user-5c', centralUserId: null } as User;
      await expect(service.findOne(testUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call tierRepository with the tierId from Mcom Solutions', async () => {
      mockMcomCentralService.getUserPackages.mockResolvedValue({
        tierId: 'tier-from-solutions',
        isActive: true,
        packages: [],
      });
      mockTierRepository.findOne.mockResolvedValue({ id: 'tier-from-solutions', name: 'Pro' });

      const testUser = { id: 'user-6', centralUserId: 'central-6' } as User;
      await service.findOne(testUser);

      expect(mockTierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tier-from-solutions' },
      });
    });
  });
});
