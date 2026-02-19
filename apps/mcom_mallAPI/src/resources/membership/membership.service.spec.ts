import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MembershipService } from './membership.service';
import { Membership } from './entities/membership.entity';
import { User } from '../users/entities/user.entity';
import { MembershipTier } from './membership-tier.enum';
import { UserRole } from '../../common/role.enum';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { MembershipPayment } from './entities/membership-payment.entity';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { InitiateMembershipPaymentDto, PlanType } from './dto/initiate-membership-payment.dto';
import { VerifyMembershipPaymentDto } from './dto/verify-membership-payment.dto';
import { Tier } from '../tier/entities/tier.entity';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { TierType } from '../tier/enums/tier-type.enum';

describe('MembershipService', () => {
  let service: MembershipService;
  let membershipRepository: Repository<Membership>;
  let userRepository: Repository<User>;
  let paymentRepository: Repository<MembershipPayment>;
  let tierRepository: Repository<Tier>;
  let paymentProviderService: PaymentProviderService;
  let dataSource: DataSource;

  const mockMembershipRepository = {
    create: jest.fn().mockImplementation(dto => ({ ...dto })),
    save: jest.fn().mockImplementation(m => Promise.resolve(m)),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    save: jest.fn().mockImplementation(u => Promise.resolve(u)),
    findOne: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(p => Promise.resolve(p)),
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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
    membershipRepository = module.get<Repository<Membership>>(
      getRepositoryToken(Membership),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    paymentRepository = module.get<Repository<MembershipPayment>>(
      getRepositoryToken(MembershipPayment),
    );
    tierRepository = module.get<Repository<Tier>>(getRepositoryToken(Tier));
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    dataSource = module.get<DataSource>(DataSource);

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
      const season = { startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31') };
      const seasonalTier = { id: 'tier-1', type: TierType.SEASONAL, season };
      
      const verifyDto: VerifyMembershipPaymentDto = {
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
        purchaseDetails: { tierId: 'tier-1', planType: PlanType.MONTHLY },
      };

      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockTierRepository.findOne.mockResolvedValue(seasonalTier);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({ ok: true });
      mockMembershipRepository.create.mockImplementation(dto => dto);
      mockMembershipRepository.save.mockImplementation(m => Promise.resolve(m));

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
        expiresAt: new Date('2026-02-01') 
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
});
