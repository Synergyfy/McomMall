import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VoucherService } from '../voucher.service';
import { Voucher, VoucherStatus } from '../entities/voucher.entity';
import { VoucherProduct } from '../entities/voucher-product.entity';
import {
  VoucherTransaction,
  TransactionType,
} from '../entities/voucher-transaction.entity';
import { Business } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentProviderService } from '../../payments/services/payment-provider.service';
import { Order } from '../../order/entities/order.entity';
import {
  OrderPayment,
  PaymentMethod,
} from '../../order/entities/order-payment.entity';
import { InitiateVoucherPurchaseDto } from '../dto/initiate-voucher-purchase.dto';
import { VerifyVoucherPurchaseDto } from '../dto/verify-voucher-purchase.dto';
import { RedeemVoucherDto } from '../dto/redeem-voucher.dto';
import { WalletService } from '../../wallet/wallet.service';
import { CentralIntegrationService } from '../../payments/services/central-integration.service';
import { DataSource } from 'typeorm';
import { DigitalValueService } from '../../digital-value/digital-value.service';

// Mock repositories
const mockVoucherRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockVoucherProductRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  findOneBy: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockVoucherTransactionRepository = {
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockBusinessRepository = {
  findOne: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockOrderRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockOrderPaymentRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockPaymentProviderService = {
  createStripePaymentIntent: jest.fn(),
  createPaypalOrder: jest.fn(),
  verifyStripePaymentIntent: jest.fn(),
  captureAndVerifyPaypalOrder: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
  manager: {
    getRepository: jest.fn(),
    transaction: jest.fn(),
  },
};

describe('VoucherService', () => {
  let service: VoucherService;
  let voucherTransactionRepository: any;
  let voucherProductRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: getRepositoryToken(Voucher),
          useValue: mockVoucherRepository,
        },
        {
          provide: getRepositoryToken(VoucherProduct),
          useValue: mockVoucherProductRepository,
        },
        {
          provide: getRepositoryToken(VoucherTransaction),
          useValue: mockVoucherTransactionRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        {
          provide: getRepositoryToken(OrderPayment),
          useValue: mockOrderPaymentRepository,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        {
          provide: CentralIntegrationService,
          useValue: {
            processCashback: jest.fn(),
          },
        },
        {
          provide: DigitalValueService,
          useValue: {
            create: jest.fn().mockResolvedValue({ code: 'DV-CODE' }),
            getByCode: jest
              .fn()
              .mockResolvedValue({ id: 'dv-id', code: 'DV-CODE' }),
            fund: jest.fn().mockResolvedValue({}),
            redeem: jest.fn().mockResolvedValue({}),
          },
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: WalletService, useValue: { creditEarning: jest.fn() } },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
    voucherTransactionRepository = module.get(
      getRepositoryToken(VoucherTransaction),
    );
    voucherProductRepository = module.get(getRepositoryToken(VoucherProduct));

    // Default mock implementations
    mockVoucherTransactionRepository.create.mockImplementation((dto) => dto);
    mockVoucherTransactionRepository.save.mockImplementation((t) =>
      Promise.resolve(t),
    );
    mockVoucherRepository.save.mockImplementation((v) => Promise.resolve(v));

    mockDataSource.manager.transaction.mockImplementation(async (callback) => {
      const manager = {
        getRepository: (entity) => {
          if (entity === Voucher) return mockVoucherRepository;
          if (entity === VoucherTransaction)
            return mockVoucherTransactionRepository;
          if (entity === User) return mockUserRepository;
        },
        transaction: jest.fn().mockImplementation(async (cb) => {
          return await cb(manager);
        }),
      };
      return callback(manager);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ... other tests from before ...

  describe('verifyAndCompletePurchase', () => {
    const user = { id: 'user-1' } as User;
    const product = {
      id: 'prod-1',
      isEnabled: true,
      user: { id: 'owner-1', isActive: true },
      fixedAmounts: [20],
    } as VoucherProduct;
    const purchaseDetails: InitiateVoucherPurchaseDto = {
      voucherProductId: 'prod-1',
      amount: 20,
      paymentProvider: PaymentMethod.STRIPE,
    };
    const verifyDto: VerifyVoucherPurchaseDto = {
      purchaseDetails,
      paymentProvider: PaymentMethod.STRIPE,
      transactionId: 'pi_123',
    };

    beforeEach(() => {
      mockDataSource.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === Order) return mockOrderRepository;
            if (entity === OrderPayment) return mockOrderPaymentRepository;
            if (entity === Voucher) return mockVoucherRepository;
            if (entity === VoucherTransaction)
              return mockVoucherTransactionRepository;
          },
          findOne: jest.fn().mockResolvedValue(user),
        };
        return callback(manager);
      });

      mockVoucherProductRepository.findOne.mockResolvedValue(product);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({
        ok: true,
      });

      mockOrderPaymentRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 'payment-1',
      }));
      mockOrderRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 'order-1',
      }));
      mockVoucherRepository.create.mockImplementation((dto) => ({
        ...dto,
        id: 'voucher-1',
      }));

      mockOrderPaymentRepository.save.mockImplementation((p) =>
        Promise.resolve(p),
      );
      mockOrderRepository.save.mockImplementation((o) => Promise.resolve(o));
    });

    it('should create a transaction with correct initial balances', async () => {
      await service.verifyAndCompletePurchase(verifyDto, user.id);

      expect(mockVoucherTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.PURCHASE,
          amount: 20,
          balanceBefore: 0,
          balanceAfter: 20,
        }),
      );
      expect(mockVoucherTransactionRepository.save).toHaveBeenCalled();
    });
  });

  describe('redeemVoucher', () => {
    it('should fully redeem a voucher and record correct balances', async () => {
      const voucher = {
        id: 'voucher-id-1',
        code: 'TESTCODE',
        balance: 50,
        status: VoucherStatus.UNREDEEMED,
        voucherProduct: { allowPartialRedemption: false },
      } as Voucher;
      mockVoucherRepository.findOne.mockResolvedValue(voucher);

      const result = await service.redeemVoucher({ code: 'TESTCODE' });

      expect(result.balance).toBe(0);
      expect(result.status).toBe(VoucherStatus.REDEEMED);
      expect(mockVoucherTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50,
          balanceBefore: 50,
          balanceAfter: 0,
        }),
      );
    });

    it('should partially redeem a voucher and record correct balances', async () => {
      const voucher = {
        id: 'voucher-id-1',
        code: 'TESTCODE',
        balance: 50,
        status: VoucherStatus.UNREDEEMED,
        voucherProduct: { allowPartialRedemption: true },
      } as Voucher;
      mockVoucherRepository.findOne.mockResolvedValue(voucher);

      const result = await service.redeemVoucher({
        code: 'TESTCODE',
        amount: 20,
      });

      expect(result.balance).toBe(30);
      expect(result.status).toBe(VoucherStatus.PARTIALLY_REDEEMED);
      expect(mockVoucherTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 20,
          balanceBefore: 50,
          balanceAfter: 30,
        }),
      );
    });
  });

  describe('redeemForOrder', () => {
    it('should redeem a voucher for an order and record correct balances', async () => {
      const voucher = {
        id: 'voucher-id-1',
        code: 'TESTCODE',
        balance: 75,
        status: VoucherStatus.UNREDEEMED,
        voucherProduct: { allowPartialRedemption: true },
      } as Voucher;
      const order = { id: 'order-1' } as Order;
      const redeemDto: RedeemVoucherDto = { code: 'TESTCODE', amount: 50 };
      mockVoucherRepository.findOne.mockResolvedValue(voucher);

      const manager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === Voucher) {
            return mockVoucherRepository;
          }
          if (entity === VoucherTransaction) {
            return mockVoucherTransactionRepository;
          }
          return undefined;
        }),
        transaction: jest.fn().mockImplementation(async (callback) => {
          return await callback(manager);
        }),
      };

      const result = await service.redeemForOrder(
        redeemDto,
        order,
        manager as any,
      );

      expect(result.balance).toBe(25);
      expect(result.status).toBe(VoucherStatus.PARTIALLY_REDEEMED);
      expect(mockVoucherTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50,
          balanceBefore: 75,
          balanceAfter: 25,
          order: order,
        }),
      );
    });
  });

  describe('getSummaryStatistics', () => {
    it('should return summary statistics for a voucher owner', async () => {
      const ownerId = 'owner-1';
      (voucherTransactionRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce({
          innerJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '5000' }),
        })
        .mockReturnValueOnce({
          innerJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '2500' }),
        });

      const result = await service.getSummaryStatistics(ownerId);

      expect(result).toEqual({
        totalSold: 5000,
        totalRedeemed: 2500,
        outstandingLiability: 2500,
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return a paginated transaction history for a voucher owner', async () => {
      const ownerId = 'owner-1';
      const query = {
        page: 1,
        limit: 10,
        skip: 0,
        take: 10,
        order: 'DESC',
      };
      const transactions = [
        {
          id: '1',
          amount: 50,
          type: 'PURCHASE',
          createdAt: new Date(),
          voucher: {
            buyer: { id: 'user1', name: 'John Doe', email: 'john@a.com' },
          },
        },
      ];
      (
        voucherTransactionRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([transactions, 1]),
      });

      const result = await service.getTransactionHistory(ownerId, query as any);

      expect(result.data.length).toBe(1);
      expect(result.meta.itemCount).toBe(1);
    });
  });

  describe('findAllPublicVoucherProducts', () => {
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
      (
        voucherProductRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue(queryBuilder);
    });

    it('should filter by search, min/max amount, businessId and businessName', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const searchDto = {
        page: 1,
        limit: 10,
        search: 'Voucher',
        minAmount: 10,
        maxAmount: 200,
        businessId: 'bus-1',
        businessName: 'My Business',
      };

      await service.findAllPublicVoucherProducts(searchDto as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(voucherProduct.name ILIKE :search OR voucherProduct.description ILIKE :search)',
        { search: '%Voucher%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'voucherProduct.minCustomAmount >= :minAmount',
        { minAmount: 10 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'voucherProduct.maxCustomAmount <= :maxAmount',
        { maxAmount: 200 },
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
        'voucherProduct.createdAt',
        'DESC',
      );
    });
  });
});
