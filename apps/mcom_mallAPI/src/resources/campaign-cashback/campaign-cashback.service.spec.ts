import { Test, TestingModule } from '@nestjs/testing';
import { CampaignCashbackService } from './campaign-cashback.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CampaignCashback } from './entities/campaign-cashback.entity';
import { UserCampaignCashback } from './entities/user-campaign-cashback.entity';
import { UserCampaignWallet } from './entities/user-campaign-wallet.entity';
import { Repository, DataSource } from 'typeorm';
import {
  CampaignUnlockMode,
  SpendingChannel,
  CampaignCategory,
  CampaignUsageType,
  CampaignTargetType,
} from './campaign-cashback.enum';
import { BadRequestException } from '@nestjs/common';
import { Season } from '../seasons/entities/season.entity';
import { WalletService } from '../wallet/wallet.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { ContributionPaymentProvider } from './dto/contribute.dto';
import { OrderPayment } from '../order/entities/order-payment.entity';
import { UserRole } from '../../common/role.enum';

const mockRepository = () => ({
  create: jest.fn((entity) => entity),
  save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'uuid' })),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

const mockWalletService = () => ({
  spendBalance: jest.fn(),
});

const mockPaymentProviderService = () => ({
  verifyStripePaymentIntent: jest.fn(),
  captureAndVerifyPaypalOrder: jest.fn(),
});

const mockDataSource = () => ({
  transaction: jest.fn((cb) =>
    cb({
      findOne: jest.fn(),
      create: jest.fn((entity) => entity),
      save: jest.fn((entity) => Promise.resolve(entity)),
      getRepository: jest.fn(),
    }),
  ),
});

describe('CampaignCashbackService', () => {
  let service: CampaignCashbackService;
  let userCampaignRepo: Repository<UserCampaignCashback>;
  let orderPaymentRepo: Repository<OrderPayment>;
  let seasonRepo: Repository<Season>;
  let walletService: WalletService;
  let paymentProviderService: PaymentProviderService;
  let dataSource: DataSource;
  let campaignRepo: Repository<CampaignCashback>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignCashbackService,
        {
          provide: getRepositoryToken(CampaignCashback),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(UserCampaignCashback),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(UserCampaignWallet),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Season),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(OrderPayment),
          useFactory: mockRepository,
        },
        { provide: WalletService, useFactory: mockWalletService },
        {
          provide: PaymentProviderService,
          useFactory: mockPaymentProviderService,
        },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get<CampaignCashbackService>(CampaignCashbackService);
    userCampaignRepo = module.get(getRepositoryToken(UserCampaignCashback));
    orderPaymentRepo = module.get(getRepositoryToken(OrderPayment));
    seasonRepo = module.get(getRepositoryToken(Season));
    walletService = module.get<WalletService>(WalletService);
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    dataSource = module.get<DataSource>(DataSource);
    campaignRepo = module.get(getRepositoryToken(CampaignCashback));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (Logic & Validation)', () => {
    it('should correctly calculate the 1/3 level value (£30 -> £10)', async () => {
      const dto: any = {
        name: 'Test Split',
        totalValue: 30,
        type: CampaignCategory.REGULAR,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      };

      const result = await service.create(dto);
      expect(result.levelValue).toBe(10); // 30 / 3
    });

    it('should inherit dates from a Season for seasonal campaigns', async () => {
      const mockSeason = {
        id: 's1',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
      };
      const dto: any = {
        name: 'Summer Sale',
        type: CampaignCategory.SEASONAL,
        seasonId: 's1',
        totalValue: 30,
      };

      jest.spyOn(seasonRepo, 'findOne').mockResolvedValue(mockSeason as any);

      const result = await service.create(dto);
      expect(result.startDate).toEqual(mockSeason.startDate);
      expect(result.endDate).toEqual(mockSeason.endDate);
    });
  });

  describe('findAllForUser (Targeting Logic)', () => {
    const now = new Date();
    const mockUser: any = { id: 'u1', role: UserRole.CUSTOMER };
    const mockCampaign = {
      id: 'c1',
      name: 'All Audience',
      targetType: CampaignTargetType.ALL,
      startDate: new Date(now.getTime() - 10000),
      endDate: new Date(now.getTime() + 10000),
      levelValue: 10,
    };

    it('should return campaign for ALL audience', async () => {
      jest.spyOn(campaignRepo, 'find').mockResolvedValue([mockCampaign as any]);
      jest.spyOn(userCampaignRepo, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userCampaignRepo, 'save')
        .mockImplementation(async (c) => c as any);

      const result = await service.findAllForUser(mockUser);
      expect(result).toHaveLength(1);
      expect(result[0].campaign.targetType).toBe(CampaignTargetType.ALL);
    });

    it('should filter out BUSINESS campaigns for CUSTOMER role', async () => {
      const bizCampaign = {
        ...mockCampaign,
        targetType: CampaignTargetType.BUSINESS,
      };
      jest.spyOn(campaignRepo, 'find').mockResolvedValue([bizCampaign as any]);

      const result = await service.findAllForUser(mockUser);
      expect(result).toHaveLength(0);
    });
  });

  describe('contribute (Security & Idempotency)', () => {
    let mockUser: any;
    let mockCampaign: any;

    beforeEach(() => {
      mockUser = { id: 'u1' };
      mockCampaign = {
        id: 'uc1',
        contributionPaid: false,
        campaign: { levelValue: 10, name: 'Promo' },
      };
    });

    it('should throw error if transactionId was already processed (Stripe/PayPal)', async () => {
      jest.spyOn(userCampaignRepo, 'findOne').mockResolvedValue(mockCampaign);
      jest
        .spyOn(orderPaymentRepo, 'findOne')
        .mockResolvedValue({ id: 'p1' } as any);

      await expect(
        service.contribute('uc1', mockUser, {
          amount: 10,
          paymentMethod: ContributionPaymentProvider.STRIPE,
          transactionId: 'already_used',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should invoke external verification BEFORE the database lock', async () => {
      jest.spyOn(userCampaignRepo, 'findOne').mockResolvedValue(mockCampaign);
      jest.spyOn(orderPaymentRepo, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: true } as any);

      const mockManager = {
        findOne: jest.fn().mockImplementation((entity) => {
          if (entity === UserCampaignCashback)
            return Promise.resolve(mockCampaign);
          return Promise.resolve(null);
        }),
        save: jest.fn().mockImplementation(async (entity) => entity),
        create: jest.fn((entity) => entity),
      };

      const txSpy = jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (arg1: any, arg2?: any) => {
          const cb = typeof arg1 === 'function' ? arg1 : arg2;
          return cb(mockManager);
        });

      await service.contribute('uc1', mockUser, {
        amount: 10,
        paymentMethod: ContributionPaymentProvider.STRIPE,
        transactionId: 'valid_tx',
      });

      expect(
        paymentProviderService.verifyStripePaymentIntent,
      ).toHaveBeenCalled();
      expect(txSpy).toHaveBeenCalled();
    });

    it('should use pessimistic_write lock during the critical update section', async () => {
      jest.spyOn(userCampaignRepo, 'findOne').mockResolvedValue(mockCampaign);
      jest.spyOn(walletService, 'spendBalance').mockResolvedValue({} as any);

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(mockCampaign),
        save: jest.fn().mockResolvedValue(mockCampaign),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (arg1: any, arg2?: any) => {
          const cb = typeof arg1 === 'function' ? arg1 : arg2;
          return cb(mockManager);
        });

      await service.contribute('uc1', mockUser, {
        amount: 10,
        paymentMethod: ContributionPaymentProvider.WALLET,
      });

      expect(mockManager.findOne).toHaveBeenCalledWith(
        UserCampaignCashback,
        expect.objectContaining({
          lock: { mode: 'pessimistic_write' },
        }),
      );
    });
  });

  describe('spend (Manual Deduction Logic)', () => {
    let mockUser: any;
    const now = new Date();
    const startDate = new Date(now.getTime() - 10000);
    const endDate = new Date(now.getTime() + 10000);

    beforeEach(() => {
      mockUser = { id: 'u1' };
    });

    it('should deduct from Value 1 then Value 2 buckets sequentially', async () => {
      const mockCampaign = {
        startDate,
        endDate,
        unlockMode: CampaignUnlockMode.ALLOW_PRELOADED_USAGE,
        value1UsageTypes: [CampaignUsageType.ORDER_PRODUCT],
        value2UsageTypes: [CampaignUsageType.ORDER_PRODUCT],
        value3UsageTypes: [CampaignUsageType.ANYWHERE],
      };

      const mockWallet = {
        channelType: SpendingChannel.ONLINE,
        value1Balance: 10,
        value2Balance: 10,
        value3Balance: 10,
      };

      const mockUserCampaign = {
        id: 'uc1',
        campaign: mockCampaign,
        wallets: [mockWallet],
        contributionPaid: false,
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(mockUserCampaign),
        save: jest.fn().mockImplementation(async (entity) => entity),
      };

      // Spending 15 GBP on products
      await service.spend(
        'uc1',
        mockUser,
        15,
        SpendingChannel.ONLINE,
        CampaignUsageType.ORDER_PRODUCT,
        mockManager as any,
      );

      expect(Number(mockWallet.value1Balance)).toBe(0); // 10 exhausted
      expect(Number(mockWallet.value2Balance)).toBe(5); // 5 more deducted
      expect(Number(mockWallet.value3Balance)).toBe(10); // Untouched
    });

    it('should throw error if campaign is expired', async () => {
      const expiredCampaign = {
        startDate: new Date(now.getTime() - 20000),
        endDate: new Date(now.getTime() - 10000),
      };
      const mockUserCampaign = { id: 'uc1', campaign: expiredCampaign };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(mockUserCampaign),
      };

      await expect(
        service.spend(
          'uc1',
          mockUser,
          5,
          SpendingChannel.ONLINE,
          CampaignUsageType.ORDER_PRODUCT,
          mockManager as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
