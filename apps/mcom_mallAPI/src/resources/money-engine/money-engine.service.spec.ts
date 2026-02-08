import { Test, TestingModule } from '@nestjs/testing';
import { MoneyEngineService } from './money-engine.service';
import { DataSource, EntityManager } from 'typeorm';
import { RewardDefinition, ScopeType } from './entities/reward-definition.entity';
import { UserVoucher, VoucherState } from './entities/user-voucher.entity';
import { VoucherTransaction, TransactionSourceType } from './entities/voucher-transaction.entity';
import { BadRequestException } from '@nestjs/common';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { PaymentGateway } from '../payments/enums/payment-gateway.enum';

const mockEntityManager = {
  findOne: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    relation: jest.fn().mockReturnThis(),
    of: jest.fn().mockReturnThis(),
    loadMany: jest.fn(),
  })),
};

const mockDataSource = {
  transaction: jest.fn((cb) => cb(mockEntityManager)),
  manager: mockEntityManager,
};

const mockPaymentProviderService = {
  verifyStripePaymentIntent: jest.fn(),
  captureAndVerifyPaypalOrder: jest.fn(),
};

describe('MoneyEngineService', () => {
  let service: MoneyEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoneyEngineService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
      ],
    }).compile();

    service = module.get<MoneyEngineService>(MoneyEngineService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('purchaseVoucher', () => {
    it('should split payment correctly (50/50) and verify Stripe payment', async () => {
      const definition = new RewardDefinition();
      definition.splitRatio = { real: 0.5, reward: 0.5 };
      definition.isActive = true;
      mockEntityManager.findOne.mockResolvedValue(definition);
      mockEntityManager.save.mockImplementation((entity) => Promise.resolve({ ...entity, id: 'voucher-1' }));
      
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({ ok: true });

      const result = await service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 50,
        transactionId: 'pi_123',
        paymentGateway: PaymentGateway.STRIPE,
      });

      expect(mockPaymentProviderService.verifyStripePaymentIntent).toHaveBeenCalledWith('pi_123', 50, 'gbp');
      expect(result.realBalance).toBe(50);
      expect(result.rewardBalance).toBe(50); // 50 / 0.5 = 100 total -> 50 reward
      expect(mockEntityManager.save).toHaveBeenCalledTimes(3); // Voucher, Tx1, Tx2
    });

    it('should verify PayPal payment', async () => {
      const definition = new RewardDefinition();
      definition.splitRatio = { real: 0.5, reward: 0.5 };
      definition.isActive = true;
      mockEntityManager.findOne.mockResolvedValue(definition);
      mockEntityManager.save.mockImplementation((entity) => Promise.resolve({ ...entity, id: 'voucher-1' }));

      mockPaymentProviderService.captureAndVerifyPaypalOrder.mockResolvedValue({ ok: true });

      await service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 50,
        transactionId: 'order_123',
        paymentGateway: PaymentGateway.PAYPAL,
      });

      expect(mockPaymentProviderService.captureAndVerifyPaypalOrder).toHaveBeenCalledWith('order_123', 50, 'gbp');
    });

    it('should throw BadRequestException if payment verification fails', async () => {
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({ ok: false, reason: 'failed' });

      await expect(service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 50,
        transactionId: 'pi_123',
        paymentGateway: PaymentGateway.STRIPE,
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if definition is inactive', async () => {
      const definition = new RewardDefinition();
      definition.isActive = false;
      mockEntityManager.findOne.mockResolvedValue(definition);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({ ok: true });

      await expect(service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 50,
        transactionId: 'pi_123',
        paymentGateway: PaymentGateway.STRIPE,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('injectCashback', () => {
    it('should add to reward balance', async () => {
      const voucher = new UserVoucher();
      voucher.state = VoucherState.ACTIVE;
      voucher.rewardBalance = 10;
      voucher.definition = { scopeType: ScopeType.ANY_SHOP } as RewardDefinition;
      
      mockEntityManager.findOne.mockResolvedValue(voucher);
      mockEntityManager.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.injectCashback({
        userVoucherId: 'v-1',
        amount: 5,
        shopId: 's-1',
      });

      expect(result.rewardBalance).toBe(15);
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2); // Voucher, Tx
    });
  });

  describe('spend', () => {
    it('should burn Real Money first', async () => {
      const voucher = new UserVoucher();
      voucher.state = VoucherState.ACTIVE;
      voucher.realBalance = 50;
      voucher.rewardBalance = 50;
      voucher.definition = { scopeType: ScopeType.ANY_SHOP, burnStrategy: 'real_first' } as RewardDefinition;
      
      mockEntityManager.findOne.mockResolvedValue(voucher);
      mockEntityManager.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.spend({
        userVoucherId: 'v-1',
        amount: 60,
        shopId: 's-1',
      });

      // 60 spent: 50 Real (all), 10 Reward
      expect(voucher.realBalance).toBe(0);
      expect(voucher.rewardBalance).toBe(40);
      
      const txCall = mockEntityManager.save.mock.calls.find(call => call[0] instanceof VoucherTransaction);
      const tx = txCall[0];
      expect(tx.realAmountDelta).toBe(-50);
      expect(tx.rewardAmountDelta).toBe(-10);
    });

    it('should burn Reward Money first if configured', async () => {
      const voucher = new UserVoucher();
      voucher.state = VoucherState.ACTIVE;
      voucher.realBalance = 50;
      voucher.rewardBalance = 50;
      voucher.definition = { 
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: 'reward_first'
      } as RewardDefinition;
      
      mockEntityManager.findOne.mockResolvedValue(voucher);
      mockEntityManager.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.spend({
        userVoucherId: 'v-1',
        amount: 60,
        shopId: 's-1',
      });

      // 60 spent: 50 Reward (all), 10 Real
      expect(voucher.rewardBalance).toBe(0);
      expect(voucher.realBalance).toBe(40);
    });

    it('should fail if insufficient funds', async () => {
      const voucher = new UserVoucher();
      voucher.state = VoucherState.ACTIVE;
      voucher.realBalance = 10;
      voucher.rewardBalance = 10;
      voucher.definition = { scopeType: ScopeType.ANY_SHOP } as RewardDefinition;

      mockEntityManager.findOne.mockResolvedValue(voucher);

      await expect(service.spend({
        userVoucherId: 'v-1',
        amount: 30,
        shopId: 's-1',
      })).rejects.toThrow(BadRequestException);
    });
  });
});