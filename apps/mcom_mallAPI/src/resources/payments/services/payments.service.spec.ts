import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { User } from '../../users/entities/user.entity';
import { PaymentHistory } from '../entities/payment-history.entity';
import { PlanType } from '../enums/plan-type.enum';
import { SubscriptionStatusEnum } from '../dto/subscription-status.dto';
import { PaymentProviderService } from './payment-provider.service';
import { MembershipService } from 'src/resources/membership/membership.service';
import { Tier } from '../../tier/entities/tier.entity';
import { CentralIntegrationService } from './central-integration.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let membershipService: MembershipService;
  let paymentHistoryRepository: Repository<PaymentHistory>;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    isActive: true,
    isEmailVerified: true,
    role: 'OWNER',
    password: 'hashedpassword',
    points: 100,
    created_at: new Date(),
    updated_at: new Date(),
    businesses: [],
    coupons: [],
    promotionParticipations: [],
    reviews: [],
    socials: null,
    transactions: [],
    promotions: [],
    purchasedVouchers: [],
    voucherProducts: [],
    vouchers: [],
    offers: [],
    serviceProviderProfile: null,
    couponTransactions: [],
    membership: null,
    wallet: null,
    deleted_at: null,
    giftCard: true,
    voucher: true,
    promotion: true,
  } as unknown as User;

  const mockMembershipService = {
    findOne: jest.fn(),
    verifyAndCreateMembership: jest.fn(),
  };

  const mockTierRepository = {
    findOne: jest.fn(),
  };

  const mockCentralIntegrationService = {
    processCashback: jest.fn(),
  };

  const mockPaymentHistoryRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(dto => Promise.resolve({ id: 'ph-id', ...dto })),
  };

  const mockPaymentProviderService = {
    verifyStripePaymentIntent: jest.fn().mockResolvedValue({ ok: true }),
    captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn().mockResolvedValue(mockUser) },
        },
        {
          provide: getRepositoryToken(PaymentHistory),
          useValue: mockPaymentHistoryRepository,
        },
        {
          provide: getRepositoryToken(Tier),
          useValue: mockTierRepository,
        },
        {
          provide: MembershipService,
          useValue: mockMembershipService,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        {
          provide: CentralIntegrationService,
          useValue: mockCentralIntegrationService,
        }
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    membershipService = module.get<MembershipService>(MembershipService);
    paymentHistoryRepository = module.get<Repository<PaymentHistory>>(
      getRepositoryToken(PaymentHistory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionStatus', () => {
    it('should return an active trial status if the membership is active trial', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days left
      const membership = {
        id: '1',
        isTrial: true,
        isActive: true,
        expiresAt: expiresAt,
        user: mockUser,
      };

      mockMembershipService.findOne.mockResolvedValue(membership);

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.TRIAL_ACTIVE);
      expect(result.isPaused).toBe(false);
      expect(result.trialEndDate).toEqual(expiresAt);
    });

    it('should return an expired trial status if the membership is trial but inactive', async () => {
      const membership = {
        id: '1',
        isTrial: true,
        isActive: false, // Inactive
        expiresAt: new Date(),
        user: mockUser,
      };

      mockMembershipService.findOne.mockResolvedValue(membership);

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.TRIAL_EXPIRED);
    });

    it('should return a paid status if the user has a payment history and no trial membership', async () => {
      mockMembershipService.findOne.mockResolvedValue(null);
      const paymentHistory = {
        id: '1',
        user: { id: '1' },
        planType: PlanType.PAYG,
      } as PaymentHistory;
      mockPaymentHistoryRepository.findOne.mockReturnValue(
        Promise.resolve(paymentHistory),
      );

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.PAID);
    });

    it('should return an inactive status if the user has no trial membership or payment history', async () => {
      mockMembershipService.findOne.mockResolvedValue(null);
      mockPaymentHistoryRepository.findOne.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.INACTIVE);
    });
  });
});
