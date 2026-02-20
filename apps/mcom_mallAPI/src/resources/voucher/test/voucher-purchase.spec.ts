import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { VoucherService } from '../voucher.service';
import { Voucher, VoucherStatus } from '../entities/voucher.entity';
import { VoucherProduct } from '../entities/voucher-product.entity';
import {
  VoucherTransaction,
  TransactionType,
} from '../entities/voucher-transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../listings/entities/listing.entity';
import { Order } from '../../order/entities/order.entity';
import {
  OrderPayment,
  PaymentMethod,
} from '../../order/entities/order-payment.entity';
import { PaymentProviderService } from '../../payments/services/payment-provider.service';
import { VerifyVoucherPurchaseDto } from '../dto/verify-voucher-purchase.dto';
import { InitiateVoucherPurchaseDto } from '../dto/initiate-voucher-purchase.dto';
import { RedeemVoucherDto } from '../dto/redeem-voucher.dto';
import { WalletService } from '../../wallet/wallet.service';

// Mock repository provider
const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
});

// Mock DataSource for transactions
const createMockDataSource = () => ({
  transaction: jest.fn().mockImplementation(async (callback) => {
    const manager = {
      getRepository: (entity) => {
        // Return a mock repository for the given entity
        if (entity === Voucher) return mockVoucherRepository;
        if (entity === VoucherTransaction)
          return mockVoucherTransactionRepository;
        if (entity === Order) return mockOrderRepository;
        if (entity === OrderPayment) return mockOrderPaymentRepository;
        return createMockRepository();
      },
    };
    return callback(manager);
  }),
});

let service: VoucherService;
let mockVoucherRepository;
let mockVoucherProductRepository;
let mockVoucherTransactionRepository;
let mockPaymentProviderService;
let mockDataSource;
let mockOrderRepository;
let mockOrderPaymentRepository;

describe('VoucherService - Purchase and Redemption', () => {
  beforeEach(async () => {
    mockVoucherRepository = createMockRepository();
    mockVoucherProductRepository = createMockRepository();
    mockVoucherTransactionRepository = createMockRepository();
    mockOrderRepository = createMockRepository();
    mockOrderPaymentRepository = createMockRepository();
    mockPaymentProviderService = {
      verifyStripePaymentIntent: jest.fn(),
    };
    mockDataSource = createMockDataSource();

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
          useValue: createMockRepository(),
        },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        {
          provide: getRepositoryToken(OrderPayment),
          useValue: mockOrderPaymentRepository,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: WalletService, useValue: { creditEarning: jest.fn() } },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
  });

  describe('verifyAndCompletePurchase', () => {
    it('should create a voucher with initialValue and balance equal to the purchase amount', async () => {
      const purchaseAmount = 30;
      const userId = 'user-123';
      const mockVoucherProduct = {
        id: 'prod-123',
        isEnabled: true,
        user: { id: 'owner-123' },
        expiryDays: 365,
      };
      const verifyDto: VerifyVoucherPurchaseDto = {
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
        purchaseDetails: {
          voucherProductId: 'prod-123',
          amount: purchaseAmount,
        } as InitiateVoucherPurchaseDto,
      };

      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({
        ok: true,
      });
      mockVoucherProductRepository.findOne.mockResolvedValue(
        mockVoucherProduct,
      );

      const savedVoucher = {
        id: 'voucher-123',
        initialValue: purchaseAmount,
        balance: purchaseAmount,
        code: 'ABCD-EFGH',
      };
      mockVoucherRepository.create.mockReturnValue(savedVoucher);
      mockVoucherRepository.save.mockResolvedValue(savedVoucher);
      mockOrderPaymentRepository.create.mockReturnValue({});
      mockOrderPaymentRepository.save.mockResolvedValue({});
      mockOrderRepository.create.mockReturnValue({});
      mockOrderRepository.save.mockResolvedValue({});
      mockVoucherTransactionRepository.create.mockReturnValue({});
      mockVoucherTransactionRepository.save.mockResolvedValue({});

      const result = await service.verifyAndCompletePurchase(verifyDto, userId);

      expect(result.initialValue).toBe(purchaseAmount);
      expect(result.balance).toBe(purchaseAmount);

      // Verify transaction creation
      expect(mockVoucherTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: purchaseAmount,
          type: TransactionType.PURCHASE,
          balanceBefore: 0,
          balanceAfter: purchaseAmount,
        }),
      );
    });
  });

  describe('redeemVoucher', () => {
    it('should correctly redeem a partial amount, updating balance but not initialValue', async () => {
      const initialBalance = 30;
      const redemptionAmount = 5;
      const expectedBalance = 25;
      const mockVoucher = {
        id: 'voucher-123',
        code: 'TESTCODE',
        initialValue: initialBalance,
        balance: initialBalance,
        status: VoucherStatus.UNREDEEMED,
        voucherProduct: { allowPartialRedemption: true },
        save: jest.fn().mockReturnThis(),
      };

      mockVoucherRepository.findOne.mockResolvedValue(mockVoucher);
      mockVoucherRepository.save.mockResolvedValue({
        ...mockVoucher,
        balance: expectedBalance,
        status: VoucherStatus.PARTIALLY_REDEEMED,
      });
      mockVoucherTransactionRepository.create.mockReturnValue({});
      mockVoucherTransactionRepository.save.mockResolvedValue({});

      const redeemDto: RedeemVoucherDto = {
        code: 'TESTCODE',
        amount: redemptionAmount,
      };
      const result = await service.redeemVoucher(redeemDto);

      expect(result.initialValue).toBe(initialBalance);
      expect(result.balance).toBe(expectedBalance);
      expect(result.status).toBe(VoucherStatus.PARTIALLY_REDEEMED);

      // Verify transaction creation
      expect(mockVoucherTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: redemptionAmount,
          type: TransactionType.REDEMPTION,
          balanceBefore: initialBalance,
          balanceAfter: expectedBalance,
        }),
      );
    });
  });
});
