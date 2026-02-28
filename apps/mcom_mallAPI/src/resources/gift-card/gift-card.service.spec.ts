import { DigitalValueService } from '../digital-value/digital-value.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GiftCardService } from './gift-card.service';
import { GiftCard } from './entities/gift-card.entity';
import { GiftCardTemplate } from './entities/gift-card-template.entity';
import { GiftCardTransaction } from './entities/gift-card-transaction.entity';
import { GiftCardSettings } from './entities/gift-card-settings.entity';
import { Business } from '../listings/entities/listing.entity';
import { Order } from '../order/entities/order.entity';
import { PurchaseGiftCardDto } from './dto/purchase-gift-card.dto';
import { ForbiddenException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import {
  OrderPayment,
  PaymentMethod,
} from '../order/entities/order-payment.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';
import { GiftCardAsset } from './entities/gift-card-asset.entity';
import { GiftCardAssetService } from './gift-card-asset.service';
import { BulkCreateGiftCardDto } from './dto/bulk-create-gift-card.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { WalletService } from '../wallet/wallet.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CapabilityService } from '../capability/capability.service';

const mockOwner = { id: 'owner-1' } as User;
const mockPurchaserId = 'purchaser-user-id-1';
const mockBusiness = {
  id: 'business-1',
  user: mockOwner,
} as unknown as Business;
const mockOtherBusiness = {
  id: 'business-2',
  user: mockOwner,
} as unknown as Business;
const mockWrongBusiness = {
  id: 'business-3',
  user: { id: 'owner-2' },
} as unknown as Business;

const mockOrder = {
  id: 'order-1',
  total: 100,
  appliedOffer: null,
} as unknown as Order;

const mockTemplate = {
  id: 'template-1',
  ownerId: mockOwner.id,
  isActive: true,
  allowCustomAmount: true,
  minCustomAmount: 10,
  maxCustomAmount: 100,
  expiryPeriodDays: 365,
} as unknown as GiftCardTemplate;

describe('GiftCardService (User-Centric)', () => {
  let service: GiftCardService;
  let templateRepo: Repository<GiftCardTemplate>;
  let giftCardRepo: Repository<GiftCard>;
  let transactionRepo: Repository<GiftCardTransaction>;
  let businessRepo: Repository<Business>;
  let paymentProviderService: PaymentProviderService;
  let giftCardAssetService: GiftCardAssetService;
  let dataSource: DataSource;
  let mailerService: MailerService;

  const mockManager = {
    save: jest.fn((entity) => Promise.resolve(entity)),
    create: jest.fn((entity) => entity),
    getRepository: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockManager,
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(mockManager);
    }),
    manager: {
      save: jest.fn((entity) => Promise.resolve(entity)),
      transaction: jest.fn().mockImplementation(async (callback) => {
        return await callback(mockManager);
      }),
    },
  };

  const mockRepository = () => ({
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  const mockPaymentProviderService = {
    createStripePaymentIntent: jest
      .fn()
      .mockResolvedValue({ client_secret: 'pi_secret' }),
    createPaypalOrder: jest.fn().mockResolvedValue({ id: 'paypal_order_id' }),
    verifyStripePaymentIntent: jest.fn().mockResolvedValue({ ok: true }),
    captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftCardService,
        { provide: getRepositoryToken(GiftCard), useFactory: mockRepository },
        {
          provide: DigitalValueService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'dv-id' }),
            fund: jest.fn(),
            redeem: jest.fn(),
            getByCode: jest.fn().mockResolvedValue({ id: 'dv-id' }),
          },
        },
        {
          provide: getRepositoryToken(GiftCardTemplate),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(GiftCardTransaction),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(GiftCardSettings),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Business), useFactory: mockRepository },
        { provide: getRepositoryToken(Order), useFactory: mockRepository },
        {
          provide: getRepositoryToken(OrderPayment),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(GiftCardAsset),
          useFactory: mockRepository,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        { provide: MailerService, useValue: mockMailerService },
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: CentralIntegrationService,
          useValue: {
            processCashback: jest.fn(),
          },
        },
        {
          provide: CapabilityService,
          useValue: {
            checkPermission: jest.fn(),
          },
        },
        {
          provide: GiftCardAssetService,
          useValue: {
            findAssetsByOwner: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {
            creditEarning: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GiftCardService>(GiftCardService);
    giftCardAssetService =
      module.get<GiftCardAssetService>(GiftCardAssetService);
    templateRepo = module.get<Repository<GiftCardTemplate>>(
      getRepositoryToken(GiftCardTemplate),
    );
    giftCardRepo = module.get<Repository<GiftCard>>(
      getRepositoryToken(GiftCard),
    );
    transactionRepo = module.get<Repository<GiftCardTransaction>>(
      getRepositoryToken(GiftCardTransaction),
    );
    businessRepo = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    dataSource = module.get<DataSource>(DataSource);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePurchaseAmount', () => {
    it('should pass for a valid fixed amount', () => {
      const template = { fixedAmounts: [10, 20, 30] };
      expect(() =>
        (service as any).validatePurchaseAmount(20, template),
      ).not.toThrow();
    });

    it('should pass for a valid custom amount', () => {
      const template = {
        allowCustomAmount: true,
        minCustomAmount: 10,
        maxCustomAmount: 100,
      };
      expect(() =>
        (service as any).validatePurchaseAmount(50, template),
      ).not.toThrow();
    });

    it('should pass for a fixed amount when custom is also allowed', () => {
      const template = {
        fixedAmounts: [10, 20],
        allowCustomAmount: true,
        minCustomAmount: 15,
        maxCustomAmount: 50,
      };
      expect(() =>
        (service as any).validatePurchaseAmount(10, template),
      ).not.toThrow();
    });

    it('should pass for a custom amount when fixed amounts are also allowed', () => {
      const template = {
        fixedAmounts: [10, 20],
        allowCustomAmount: true,
        minCustomAmount: 15,
        maxCustomAmount: 50,
      };
      expect(() =>
        (service as any).validatePurchaseAmount(25, template),
      ).not.toThrow();
    });

    it('should throw for an invalid amount when both fixed and custom are allowed', () => {
      const template = {
        fixedAmounts: [10, 20],
        allowCustomAmount: true,
        minCustomAmount: 30,
        maxCustomAmount: 50,
      };
      expect(() =>
        (service as any).validatePurchaseAmount(25, template),
      ).toThrow(
        'Invalid amount. Must be one of: 10, 20 or a custom amount between 30 and 50.',
      );
    });

    it('should throw if amount is below min custom amount', () => {
      const template = { allowCustomAmount: true, minCustomAmount: 10 };
      expect(() =>
        (service as any).validatePurchaseAmount(5, template),
      ).toThrow();
    });

    it('should throw if amount is above max custom amount', () => {
      const template = { allowCustomAmount: true, maxCustomAmount: 100 };
      expect(() =>
        (service as any).validatePurchaseAmount(110, template),
      ).toThrow();
    });

    it('should throw if amount is not in the fixed list', () => {
      const template = { fixedAmounts: [10, 20, 30] };
      expect(() =>
        (service as any).validatePurchaseAmount(15, template),
      ).toThrow('Invalid amount. Must be one of: 10, 20, 30.');
    });

    it('should throw if template is not configured for purchase', () => {
      const template = {};
      expect(() =>
        (service as any).validatePurchaseAmount(50, template),
      ).toThrow('This gift card template is not configured for purchasing.');
    });
  });

  describe('initiateGiftCardPurchase', () => {
    const initiateDto: InitiatePurchaseDto = {
      templateId: mockTemplate.id,
      amount: 50,
      recipientEmail: 'test@example.com',
      paymentProvider: PaymentMethod.STRIPE,
    };

    it('should create a stripe payment intent', async () => {
      jest.spyOn(templateRepo, 'findOneBy').mockResolvedValue(mockTemplate);
      const result = await service.initiateGiftCardPurchase(
        initiateDto,
        mockPurchaserId,
      );
      expect(
        paymentProviderService.createStripePaymentIntent,
      ).toHaveBeenCalledWith(50, 'GBP');
      expect(result.clientSecret).toBe('pi_secret');
      expect(result.provider).toBe(PaymentMethod.STRIPE);
    });

    it('should create a paypal order', async () => {
      jest.spyOn(templateRepo, 'findOneBy').mockResolvedValue(mockTemplate);
      const result = await service.initiateGiftCardPurchase(
        {
          ...initiateDto,
          paymentProvider: PaymentMethod.PAYPAL,
        },
        mockPurchaserId,
      );
      expect(paymentProviderService.createPaypalOrder).toHaveBeenCalledWith(
        50,
        'GBP',
      );
      expect(result.orderId).toBe('paypal_order_id');
      expect(result.provider).toBe(PaymentMethod.PAYPAL);
    });
  });

  describe('verifyAndCompletePurchase', () => {
    const verifyDto: VerifyPurchaseDto = {
      transactionId: 'pi_123',
      paymentProvider: PaymentMethod.STRIPE,
      purchaseDetails: {
        templateId: mockTemplate.id,
        amount: 50,
        recipientEmail: 'test@example.com',
        paymentProvider: PaymentMethod.STRIPE,
      },
    };

    it('should verify payment and create a gift card with correct purchaser', async () => {
      jest.spyOn(templateRepo, 'findOneBy').mockResolvedValue(mockTemplate);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(mockBusiness);

      const result = await service.verifyAndCompletePurchase(
        verifyDto,
        mockPurchaserId,
      );

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(
        paymentProviderService.verifyStripePaymentIntent,
      ).toHaveBeenCalledWith('pi_123', 50, 'GBP');
      expect(mockManager.save).toHaveBeenCalled();
      expect(result.ownerId).toBe(mockOwner.id);
      expect(result.purchaserId).toBe(mockPurchaserId);
      expect(result.initialBalance).toBe(50);
    });

    it('should save the htmlBody when provided', async () => {
      jest.spyOn(templateRepo, 'findOneBy').mockResolvedValue(mockTemplate);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(mockBusiness);

      const verifyDtoWithHtml: VerifyPurchaseDto = {
        ...verifyDto,
        purchaseDetails: {
          ...verifyDto.purchaseDetails,
          htmlBody: '<p>Your code is GEN_GIFT_CARD_CODE</p>',
        },
      };

      const result = await service.verifyAndCompletePurchase(
        verifyDtoWithHtml,
        mockPurchaserId,
      );

      expect(result.htmlBody).toBe('<p>Your code is GEN_GIFT_CARD_CODE</p>');
    });

    it('should throw if payment verification fails', async () => {
      jest.spyOn(templateRepo, 'findOneBy').mockResolvedValue(mockTemplate);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(mockBusiness);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: false, reason: 'failed' });

      await expect(
        service.verifyAndCompletePurchase(verifyDto, mockPurchaserId),
      ).rejects.toThrow('Payment verification failed: failed');
    });
  });

  describe('findMyPurchasedCards', () => {
    it('should call the repository with the correct userId', async () => {
      const findSpy = jest.spyOn(giftCardRepo, 'find').mockResolvedValue([]);
      await service.findMyPurchasedCards(mockPurchaserId);
      expect(findSpy).toHaveBeenCalledWith({
        where: { purchaserId: mockPurchaserId },
        relations: ['purchaseBusiness', 'template'],
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('purchaseGiftCard', () => {
    const purchaseDto: PurchaseGiftCardDto = {
      templateId: mockTemplate.id,
      businessId: mockBusiness.id,
      amount: 50,
      recipientEmail: 'test@example.com',
    };

    it('should create a gift card associated with an owner', async () => {
      jest.spyOn(templateRepo, 'findOneBy').mockResolvedValue(mockTemplate);

      const result = await service.purchaseGiftCard(
        purchaseDto,
        mockBusiness,
        mockOrder,
      );

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.ownerId).toBe(mockOwner.id);
      expect(result.purchaseBusinessId).toBe(mockBusiness.id);
    });
  });

  describe('redeem', () => {
    let mockGiftCard: GiftCard;

    beforeEach(() => {
      mockGiftCard = {
        id: 'gc-1',
        code: '1234',
        currentBalance: 100,
        isActive: true,
        ownerId: mockOwner.id,
        templateId: 'template-1',
      } as unknown as GiftCard;
    });

    it('should successfully redeem at a business owned by the gift card owner', async () => {
      jest
        .spyOn(service as any, 'findActiveCardByCode')
        .mockResolvedValue(mockGiftCard);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(mockOtherBusiness);

      const redeemDto = { code: '1234', amount: 50 };
      await service.redeem(redeemDto, mockOrder, mockOtherBusiness.id);

      expect(dataSource.manager.transaction).toHaveBeenCalled();
      const savedCard: GiftCard = (mockManager.save as jest.Mock).mock
        .calls[0][0];
      expect(savedCard.currentBalance).toBe(50);
    });

    it('should throw ForbiddenException when redeeming at a business with a different owner', async () => {
      jest
        .spyOn(service as any, 'findActiveCardByCode')
        .mockResolvedValue(mockGiftCard);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(mockWrongBusiness);

      const redeemDto = { code: '1234', amount: 50 };
      await expect(
        service.redeem(redeemDto, mockOrder, mockWrongBusiness.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAssetsByTemplateId', () => {
    it("should return a user's assets based on a template id", async () => {
      const mockTemplate = {
        id: 'template-1',
        ownerId: 'owner-id-123',
      } as GiftCardTemplate;
      const mockAssets = [
        { id: 'asset-1', name: 'Asset 1' },
        { id: 'asset-2', name: 'Asset 2' },
      ] as GiftCardAsset[];

      jest
        .spyOn(service as any, 'findTemplateByIdForOwner')
        .mockResolvedValue(mockTemplate);
      jest
        .spyOn(giftCardAssetService, 'findAssetsByOwner')
        .mockResolvedValue(mockAssets);

      const result = await service.findAssetsByTemplateId(
        'template-1',
        'some-user',
      );

      expect((service as any).findTemplateByIdForOwner).toHaveBeenCalledWith(
        'template-1',
        'some-user',
      );
      expect(giftCardAssetService.findAssetsByOwner).toHaveBeenCalledWith(
        'owner-id-123',
      );
      expect(result).toEqual(mockAssets);
    });
  });

  describe('sendGiftCardEmail', () => {
    it('should use htmlBody and replace placeholder if it exists', async () => {
      const mockGiftCardWithHtml = {
        id: 'gc-html',
        code: 'HTML-CODE-123',
        recipientEmail: 'html@test.com',
        htmlBody: 'Hello, your code is GEN_GIFT_CARD_CODE!',
        purchaseBusiness: { businessName: 'Test Biz' },
      } as unknown as GiftCard;

      jest
        .spyOn(giftCardRepo, 'findOne')
        .mockResolvedValue(mockGiftCardWithHtml);

      await service.sendGiftCardEmail('gc-html');

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: 'Hello, your code is HTML-CODE-123!',
          subject: "You've received a gift card from Test Biz!",
          to: 'html@test.com',
        }),
      );
    });

    it('should use template if htmlBody does not exist', async () => {
      const mockGiftCardWithoutHtml = {
        id: 'gc-no-html',
        code: 'NO-HTML-CODE-456',
        recipientEmail: 'no-html@test.com',
        htmlBody: null,
        recipientName: 'Tester',
        initialBalance: 100,
        currency: 'GBP',
        personalMessage: 'A gift for you',
        purchaseBusiness: { businessName: 'Test Biz' },
      } as unknown as GiftCard;

      jest
        .spyOn(giftCardRepo, 'findOne')
        .mockResolvedValue(mockGiftCardWithoutHtml);

      await service.sendGiftCardEmail('gc-no-html');

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          template: './gift-card',
          context: {
            recipientName: 'Tester',
            initialBalance: 100,
            currency: 'GBP',
            code: 'NO-HTML-CODE-456',
            personalMessage: 'A gift for you',
            businessName: 'Test Biz',
          },
          subject: "You've received a gift card from Test Biz!",
          to: 'no-html@test.com',
        }),
      );
    });
  });

  describe('bulkCreateGiftCards', () => {
    const bulkCreateDto: BulkCreateGiftCardDto = {
      templateId: mockTemplate.id,
      amount: 50,
      quantity: 3,
    };
    const mockOwnerId = 'owner-id-123';

    it('should create the specified number of gift cards without recipient emails', async () => {
      jest
        .spyOn(service as any, 'findTemplateByIdForOwner')
        .mockResolvedValue(mockTemplate);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(mockBusiness);

      const result = await service.bulkCreateGiftCards(
        bulkCreateDto,
        mockOwnerId,
      );

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledTimes(6); // 3 cards + 3 transactions
      expect(result.length).toBe(3);
      result.forEach((card) => {
        expect(card.recipientEmail).toBeNull();
        expect(card.initialBalance).toBe(50);
        expect(card.ownerId).toBe(mockOwnerId);
      });
    });

    it('should throw NotFoundException if business is not found', async () => {
      jest
        .spyOn(service as any, 'findTemplateByIdForOwner')
        .mockResolvedValue(mockTemplate);
      jest.spyOn(businessRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.bulkCreateGiftCards(bulkCreateDto, mockOwnerId),
      ).rejects.toThrow('Business associated with the owner not found.');
    });
  });

  describe('findAllGiftCardsForOwner', () => {
    const mockOwnerId = 'owner-id-123';
    const mockGiftCards = [{ id: 'gc-1' }, { id: 'gc-2' }] as GiftCard[];

    let queryBuilder;

    beforeEach(() => {
      queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      (giftCardRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );
    });

    it('should return a paginated list of gift cards', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([mockGiftCards, 10]);
      const paginationDto = new PaginationQueryDto();
      paginationDto.page = 2;
      paginationDto.limit = 2;

      const result = await service.findAllGiftCardsForOwner(
        mockOwnerId,
        paginationDto,
      );

      expect(queryBuilder.skip).toHaveBeenCalledWith(2);
      expect(queryBuilder.take).toHaveBeenCalledWith(2);
      expect(result.data).toEqual(mockGiftCards);
      expect(result.meta.totalItems).toBe(10);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(2);
      expect(result.meta.totalPages).toBe(5);
    });
  });

  describe('adjustBalance', () => {
    it('should set the balance to the new amount and create a transaction for the difference', async () => {
      const mockGiftCard = {
        id: 'gc-1',
        currentBalance: 50,
        ownerId: mockOwner.id,
      } as unknown as GiftCard;
      jest
        .spyOn(service as any, 'findGiftCardDetailsForOwner')
        .mockResolvedValue(mockGiftCard);

      await service.adjustBalance(
        'gc-1',
        mockOwner.id,
        30,
        'Test adjustment',
        mockOwner.id,
      );

      expect(dataSource.transaction).toHaveBeenCalled();
      const savedCard: GiftCard = (mockManager.save as jest.Mock).mock
        .calls[0][0];
      const savedTransaction: GiftCardTransaction = (
        mockManager.save as jest.Mock
      ).mock.calls[1][0];

      expect(savedCard.currentBalance).toBe(30);
      expect(savedTransaction.amount).toBe(-20);
    });
  });

  describe('getSummaryStatistics', () => {
    it('should combine stats and chart data correctly', async () => {
      const mockStats = {
        activeCards: 10,
        outstandingLiability: 1000,
        totalSold: 2000,
        totalRedeemed: 500,
      };
      const mockChartData = {
        data: [{ month: '2023-01', sales: 1000, redemptions: 200 }],
      };

      jest.spyOn(service, 'getOwnerStats').mockResolvedValue(mockStats);
      jest
        .spyOn(service, 'getSalesVsRedemptionsChartData')
        .mockResolvedValue(mockChartData);

      const result = await service.getSummaryStatistics(mockOwner.id);

      expect(result.summary.totalGiftCards).toBe(10);
      expect(result.summary.totalLiability).toBe(1000);
      expect(result.chartData).toEqual(mockChartData);
    });
  });

  describe('getTransactionHistoryForOwner', () => {
    let queryBuilder;

    beforeEach(() => {
      queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };
      (transactionRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );
    });

    it('should correctly map transaction data to DTOs', async () => {
      const mockTransactions = [
        {
          id: 't-1',
          type: 'PURCHASE',
          amount: 100,
          created_at: new Date(),
          giftCard: {
            code: 'GC123',
            purchaser: {
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
          },
        },
        {
          id: 't-2',
          type: 'REDEEM',
          amount: -50,
          created_at: new Date(),
          giftCard: { code: 'GC456' },
          order: {
            user: {
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
            },
          },
        },
      ];
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const result = await service.getTransactionHistoryForOwner(
        mockOwner.id,
        '2023-01-01',
        '2023-01-31',
      );

      expect(result.length).toBe(2);
      expect(result[0].customerName).toBe('John Doe');
      expect(result[0].customerEmail).toBe('john.doe@example.com');
      expect(result[1].customerName).toBe('Jane Smith');
      expect(result[1].customerEmail).toBe('jane.smith@example.com');
    });

    it('should handle missing dates and fetch all transactions', async () => {
      queryBuilder.getMany.mockResolvedValue([]);
      await service.getTransactionHistoryForOwner(mockOwner.id);
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should handle only start date and fetch from that date onwards', async () => {
      queryBuilder.getMany.mockResolvedValue([]);
      await service.getTransactionHistoryForOwner(mockOwner.id, '2023-01-01');
      expect(queryBuilder.andWhere).toHaveBeenCalledWith({
        created_at: expect.any(Object),
      });
    });
  });

  describe('findAllPublicTemplates', () => {
    let queryBuilder;

    beforeEach(() => {
      queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      (templateRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );
    });

    it('should filter by search, min/max amount, businessId and businessName', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const searchDto = {
        page: 1,
        limit: 10,
        search: 'Gift',
        minAmount: 10,
        maxAmount: 100,
        businessId: 'bus-1',
        businessName: 'My Business',
      };

      await service.findAllPublicTemplates(searchDto as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(template.name ILIKE :search OR template.description ILIKE :search)',
        { search: '%Gift%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'template.minCustomAmount >= :minAmount',
        { minAmount: 10 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'template.maxCustomAmount <= :maxAmount',
        { maxAmount: 100 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'business.id = :businessId',
        { businessId: 'bus-1' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'business.businessName ILIKE :businessName',
        { businessName: '%My Business%' },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'template.created_at',
        'DESC',
      );
    });
  });
});
