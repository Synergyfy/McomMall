import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { User } from '../../users/entities/user.entity';
import { PaymentHistory } from '../entities/payment-history.entity';
import { Trial } from '../entities/trial.entity';
import { PlanType } from '../enums/plan-type.enum';
import { SubscriptionStatusEnum } from '../dto/subscription-status.dto';
import { TrialService } from '../../trial/trial.service';
import { PaymentProviderService } from './payment-provider.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let trialService: TrialService;
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
    trial: null,
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

  const mockTrialService = {
    getTrialStatus: jest.fn(),
    calculateTrialEndDate: jest.fn(),
  };

  const mockPaymentHistoryRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PaymentHistory),
          useValue: mockPaymentHistoryRepository,
        },
        {
          provide: TrialService,
          useValue: mockTrialService,
        },
        {
          provide: PaymentProviderService,
          useValue: {},
        }
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    trialService = module.get<TrialService>(TrialService);
    paymentHistoryRepository = module.get<Repository<PaymentHistory>>(
      getRepositoryToken(PaymentHistory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionStatus', () => {
    it('should return an active trial status if the trial has not expired', async () => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const trial = {
        id: '1',
        user: mockUser,
        planType: PlanType.CO_BRANDED,
        startedAt,
        totalPausedDuration: 0,
        isActive: true,
        isPaused: false,
        expiresAt: new Date(),
        pauses: [],
        tasks: {
          createdBusiness: false,
          createdProductOrService: false,
          createdPromotion: false,
          createdOffer: false,
          createdCoupon: false,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      } as Trial;
      mockTrialService.getTrialStatus.mockResolvedValue(trial);
      mockTrialService.calculateTrialEndDate.mockReturnValue(
        new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      ); // 4 days left

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.TRIAL_ACTIVE);
      expect(result.isPaused).toBe(false);
    });

    it('should return an expired trial status if the trial has expired', async () => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
      const trial = {
        id: '1',
        user: mockUser,
        planType: PlanType.CO_BRANDED,
        startedAt,
        totalPausedDuration: 0,
        isActive: false, // The service should have marked it as inactive
        isPaused: false,
        expiresAt: new Date(),
        pauses: [],
        tasks: {
          createdBusiness: false,
          createdProductOrService: false,
          createdPromotion: false,
          createdOffer: false,
          createdCoupon: false,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      } as Trial;
      mockTrialService.getTrialStatus.mockResolvedValue(trial);
      mockTrialService.calculateTrialEndDate.mockReturnValue(
        new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      ); // expired 1 day ago

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.TRIAL_EXPIRED);
    });

    it('should return an active trial status and isPaused true if the trial is paused', async () => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const trial = {
        id: '1',
        user: mockUser,
        planType: PlanType.CO_BRANDED,
        startedAt,
        totalPausedDuration: 0,
        isActive: true,
        isPaused: true,
        expiresAt: new Date(),
        pauses: [{ pausedAt: new Date(), resumedAt: null }],
        tasks: {
          createdBusiness: false,
          createdProductOrService: false,
          createdPromotion: false,
          createdOffer: false,
          createdCoupon: false,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      } as Trial;
      mockTrialService.getTrialStatus.mockResolvedValue(trial);
      mockTrialService.calculateTrialEndDate.mockReturnValue(
        new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      ); // 4 days left

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.TRIAL_ACTIVE);
      expect(result.isPaused).toBe(true);
    });

    it('should return a paid status if the user has a payment history and no trial', async () => {
      mockTrialService.getTrialStatus.mockResolvedValue(null);
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

    it('should return an inactive status if the user has no trial or payment history', async () => {
      mockTrialService.getTrialStatus.mockResolvedValue(null);
      mockPaymentHistoryRepository.findOne.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('1');

      expect(result.status).toBe(SubscriptionStatusEnum.INACTIVE);
    });
  });
});
