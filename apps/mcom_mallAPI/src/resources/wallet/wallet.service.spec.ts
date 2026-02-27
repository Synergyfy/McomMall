import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { OrderService } from '../order/order.service';
import { DataSource } from 'typeorm';
import {
  WalletTransaction,
  WalletTransactionType,
} from './entities/wallet-transaction.entity';
import { CreditEarningDto } from './dto/credit-earning.dto';
import { BookingService } from '../booking/booking.service';
import { CouponService } from '../coupon/coupon.service';
import { GiftCardService } from '../gift-card/gift-card.service';
import { VoucherService } from '../voucher/voucher.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { NotFoundException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let dataSource: DataSource;

  const mockWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockWalletTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderService = {
    getOrdersForOwner: jest.fn(),
  };

  const mockPaymentProviderService = {
    createStripePaymentIntent: jest.fn(),
    createPaypalOrder: jest.fn(),
    verifyStripePaymentIntent: jest.fn(),
    captureAndVerifyPaypalOrder: jest.fn(),
  };

  const mockGiftCardService = {
    getOwnerStats: jest.fn(),
  };
  const mockVoucherService = {
    getSummaryStatistics: jest.fn(),
  };

  const mockCouponService = {
    getSummaryStatistics: jest.fn(),
  };

  const mockBookingService = {
    getCompletedBookingsForOwner: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockWalletTransactionRepository,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: GiftCardService,
          useValue: mockGiftCardService,
        },
        {
          provide: VoucherService,
          useValue: mockVoucherService,
        },
        {
          provide: CouponService,
          useValue: mockCouponService,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWallet', () => {
    it('should create and backfill a wallet if one does not exist', async () => {
      const userId = 'user-1';
      const user = { id: userId, wallet: null };
      const orders = [{ total: 100 }, { total: 50 }];
      const giftCardStats = { totalSold: 200 };
      const voucherStats = { totalSold: 75 };
      const couponStats = { totalSold: 50 };
      const completedBookings = [{ payment: { amount: 120 } }];

      mockUserRepository.findOne.mockResolvedValue(user);
      mockOrderService.getOrdersForOwner.mockResolvedValue(orders);
      mockGiftCardService.getOwnerStats.mockResolvedValue(giftCardStats);
      mockVoucherService.getSummaryStatistics.mockResolvedValue(voucherStats);
      mockCouponService.getSummaryStatistics.mockResolvedValue(couponStats);
      mockBookingService.getCompletedBookingsForOwner.mockResolvedValue(
        completedBookings,
      );

      const newWallet = {
        user,
        balance: 0,
        earningsBalance: 545,
        spendableBalance: 0,
        totalOrders: 2,
        earningsFromOrders: 150,
        earningsFromGiftCard: 200,
        earningsFromVoucher: 75,
        earningsFromBookings: 120,
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === Wallet)
              return {
                create: () => newWallet,
                save: (w) => Promise.resolve(w),
              };
            if (entity === WalletTransaction)
              return {
                create: (t) => t,
                save: (t) => Promise.resolve(t),
              };
          },
        };
        return cb(manager);
      });

      const result = await service.getWallet(userId);

      expect(result.totalOrders).toBe(2);
      expect(result.earningsBalance).toBe(545);
      expect(result.earningsFromOrders).toBe(150);
      expect(result.earningsFromGiftCard).toBe(200);
      expect(result.earningsFromVoucher).toBe(75);
      expect(result.earningsFromBookings).toBe(120);
    });

    it('should update totalOrders for an existing wallet', async () => {
      const userId = 'user-1';
      const existingWallet = { id: 'wallet-1', totalOrders: 0 };
      const user = { id: userId, wallet: existingWallet };
      const orders = [{}, {}, {}]; // 3 orders

      mockUserRepository.findOne.mockResolvedValue(user);
      mockOrderService.getOrdersForOwner.mockResolvedValue(orders);
      mockWalletRepository.save.mockResolvedValue({
        ...existingWallet,
        totalOrders: 3,
      });

      const result = await service.getWallet(userId);

      expect(result.totalOrders).toBe(3);
      expect(mockWalletRepository.save).toHaveBeenCalledWith({
        ...existingWallet,
        totalOrders: 3,
      });
    });
  });

  describe('creditEarning', () => {
    it('should create a new wallet and credit earning if wallet does not exist', async () => {
      const creditDto: CreditEarningDto = {
        userId: 'user-1',
        amount: 100,
        type: WalletTransactionType.EARNING_BOOKING,
        description: 'Test earning',
      };
      const user = { id: 'user-1' };
      const newWallet = {
        user,
        balance: 0,
        earningsBalance: 0,
        spendableBalance: 0,
        pendingBalance: 0,
        earningsFromOrders: 0,
        earningsFromGiftCard: 0,
        earningsFromVoucher: 0,
      };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === Wallet)
              return {
                findOne: () => Promise.resolve(null),
                create: () => newWallet,
                save: (w) => Promise.resolve(w),
              };
            if (entity === WalletTransaction)
              return {
                create: (t) => t,
                save: (t) => Promise.resolve(t),
              };
          },
        };
        return cb(manager);
      });

      const result = await service.creditEarning(creditDto);

      expect(result.pendingBalance).toBe(100);
      expect(result.earningsBalance).toBe(0);
    });

    it('should credit earning to an existing wallet', async () => {
      const creditDto: CreditEarningDto = {
        userId: 'user-1',
        amount: 50,
        type: WalletTransactionType.EARNING_GIFT_CARD,
        description: 'Gift card earning',
      };

      const user = { id: 'user-1' };
      const existingWallet = {
        user,
        balance: 0,
        earningsBalance: 100,
        spendableBalance: 0,
        earningsFromOrders: 100,
        earningsFromGiftCard: 0,
        earningsFromVoucher: 0,
      };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === Wallet)
              return {
                findOne: () => Promise.resolve(existingWallet),
                save: (w) => Promise.resolve(w),
              };
            if (entity === WalletTransaction)
              return {
                create: (t) => t,
                save: (t) => Promise.resolve(t),
              };
          },
        };
        return cb(manager);
      });

      const result = await service.creditEarning(creditDto);
      expect(result.earningsBalance).toBe(150);
      expect(result.earningsFromGiftCard).toBe(50);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return a list of wallet transactions', async () => {
      const walletId = 'wallet-1';
      const transactions = [
        { id: 'txn-1', amount: 100 },
        { id: 'txn-2', amount: -20 },
      ];
      mockWalletTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getTransactionHistory(walletId);

      expect(result).toEqual(transactions);
      expect(mockWalletTransactionRepository.find).toHaveBeenCalledWith({
        where: { wallet: { id: walletId } },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('releaseBookingPayment', () => {
    it('should throw NotFoundException if booking not found', async () => {
      (dataSource.manager.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.releaseBookingPayment('1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should release payment and update wallet balances', async () => {
      const booking = {
        id: '1',
        payment: { amount: 100 },
        service: { business: { user: { id: '1' } } },
      };
      const wallet = {
        pendingBalance: 100,
        earningsBalance: 0,
        earningsFromBookings: 0,
      };
      (dataSource.manager.findOne as jest.Mock).mockResolvedValue(booking);
      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
        const manager = {
          getRepository: (entity) => {
            if (entity === Wallet)
              return {
                findOne: () => Promise.resolve(wallet),
                save: (w) => Promise.resolve(w),
              };
            if (entity === WalletTransaction)
              return {
                create: (t) => t,
                save: (t) => Promise.resolve(t),
              };
          },
        };
        return cb(manager);
      });

      const result = await service.releaseBookingPayment('1');

      expect(result.pendingBalance).toBe(0);
      expect(result.earningsBalance).toBe(100);
      expect(result.earningsFromBookings).toBe(100);
    });
  });
});
