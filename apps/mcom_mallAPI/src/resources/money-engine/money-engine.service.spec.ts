import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MoneyEngineService } from './money-engine.service';
import {
  BurnStrategy,
  RewardDefinition,
  ScopeType,
} from './entities/reward-definition.entity';
import { UserVoucher, VoucherState } from './entities/user-voucher.entity';
import {
  TransactionSourceType,
  VoucherTransaction,
} from './entities/voucher-transaction.entity';
import { PaymentHistory } from '../payments/entities/payment-history.entity';
import { PaymentGateway } from '../payments/enums/payment-gateway.enum';
import { INSTRUMENT_EVENTS } from '../../common/instrument-events';
import { Business } from '../listings/entities/listing.entity';

function buildService(
  manager: any,
  flags: { cashbackCap?: boolean; functionalType?: boolean } = {},
) {
  const dataSource = {
    transaction: jest.fn(async (cb: any) => cb(manager)),
    manager,
  };
  const paymentProviderService = {
    verifyStripePaymentIntent: jest.fn().mockResolvedValue({ ok: true }),
    createStripePaymentIntent: jest
      .fn()
      .mockResolvedValue({ client_secret: 'secret' }),
    createWalletCharge: jest.fn().mockResolvedValue({ chargeId: 'charge-1' }),
    createPaypalOrder: jest
      .fn()
      .mockResolvedValue({ id: 'paypal-1', approvalUrl: null }),
    captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({ ok: true }),
    verifyWalletCharge: jest.fn().mockResolvedValue({ ok: true }),
    settleWalletReference: jest.fn().mockResolvedValue({ ok: true }),
    createWalletHold: jest.fn().mockResolvedValue({ holdId: 'hold-1', amount: 10 }),
    buildWalletKey: jest.fn(() => 'wallet-key'),
    allocateCharge: jest.fn().mockResolvedValue({ id: 'allocation-1' }),
    getMcomCharge: jest.fn().mockResolvedValue({ id: 'charge-1' }),
    refundStripePayment: jest.fn().mockResolvedValue({ id: 'refund-1' }),
    refundPaypalOrder: jest.fn().mockResolvedValue({ id: 'refund-2' }),
  };
  const eventEmitter = { emit: jest.fn() };
  const paymentOrchestrator = {
    initiate: jest.fn(async (input: any) => {
      if (input.rail === 'stripe') {
        return {
          rail: 'stripe',
          chargeId: 'charge-1',
          providerRef: 'pi_1',
          clientSecret: 'secret',
          amount: input.amount,
          currency: input.currency,
        };
      }
      if (input.rail === 'paypal') {
        return {
          rail: 'paypal',
          chargeId: 'charge-1',
          orderId: 'paypal-1',
          approvalUrl: null,
          amount: input.amount,
          currency: input.currency,
        };
      }
      return {
        rail: 'mcom_wallet',
        chargeId: 'charge-1',
        holdId: 'hold-1',
        amount: input.amount,
        currency: input.currency,
      };
    }),
    confirm: jest.fn(async (input: any) => ({
      ok: true,
      chargeId: 'charge-1',
      transactionId: input.reference,
      providerRef: null,
      feeMinor: null,
      netMinor: null,
      method: input.rail,
      amountMinor: String(Math.round(Number(input.amount) * 100)),
      currency: String(input.currency).toUpperCase(),
      status: 'paid',
      raw: {
        id: 'charge-1',
        status: 'paid',
        amountMinor: String(Math.round(Number(input.amount) * 100)),
        currency: String(input.currency).toUpperCase(),
      },
    })),
    refund: jest.fn().mockResolvedValue({ id: 'refund-1' }),
    refundCharge: jest.fn().mockResolvedValue({ id: 'refund-1' }),
  };
  const featureFlags = {
    isCashbackCapEnabled: jest.fn(() => flags.cashbackCap ?? false),
    isFunctionalTypeEnforcementEnabled: jest.fn(
      () => flags.functionalType ?? false,
    ),
    isMoneyVoucherCheckoutEnabled: jest.fn(() => false),
    isDealsHubEnabled: jest.fn(() => false),
    isLedgerConsolidationEnabled: jest.fn(() => false),
  };
  const digitalValueService = {
    create: jest.fn().mockResolvedValue({}),
    getByCode: jest.fn().mockResolvedValue({ id: 'dv-1' }),
    fund: jest.fn().mockResolvedValue({}),
    redeem: jest.fn().mockResolvedValue({}),
  };
  const service = new MoneyEngineService(
    dataSource as any,
    paymentProviderService as any,
    paymentOrchestrator as any,
    eventEmitter as any,
    featureFlags as any,
    digitalValueService as any,
  );
  return {
    service,
    dataSource,
    paymentProviderService,
    paymentOrchestrator,
    eventEmitter,
    featureFlags,
    digitalValueService,
  };
}

function voucher(overrides: Record<string, any> = {}): UserVoucher {
  return Object.assign(new UserVoucher(), {
    id: 'uv-1',
    code: 'VOUCHER12345',
    state: VoucherState.ACTIVE,
    realBalance: 0,
    rewardBalance: 0,
    expiresAt: null,
    realContributionTarget: null,
    owner: { id: 'user-1' },
    definition: {
      id: 'def-1',
      scopeType: ScopeType.ANY_SHOP,
      burnStrategy: BurnStrategy.REAL_FIRST,
    },
    ...overrides,
  });
}

describe('MoneyEngineService.purchaseVoucher', () => {
  it('splits the payment into real and reward balances', async () => {
    const savedVouchers: UserVoucher[] = [];
    const savedTransactions: VoucherTransaction[] = [];
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        if (entity === RewardDefinition) {
          return {
            id: 'def-1',
            isActive: true,
            functionalType: 'spending_power',
            faceValue: null,
            maxCashbackPercent: 50,
            splitRatio: { real: 0.5, reward: 0.5 },
          };
        }
        return null;
      }),
      save: jest.fn(async (value: any) => {
        if (value instanceof UserVoucher) savedVouchers.push(value);
        if (value instanceof VoucherTransaction) savedTransactions.push(value);
        return value;
      }),
    };
    const { service, eventEmitter, digitalValueService } =
      buildService(manager);
    digitalValueService.getByCode.mockRejectedValueOnce(
      new NotFoundException('not found'),
    );

    const issued = await service.purchaseVoucher('user-1', {
      rewardDefinitionId: 'def-1',
      paymentAmount: 50,
      transactionId: 'pi_1',
      paymentGateway: PaymentGateway.STRIPE,
    });

    expect(issued.realBalance).toBe(50);
    expect(issued.rewardBalance).toBe(50);
    expect(issued.totalBalance).toBe(100);
    expect(issued.state).toBe(VoucherState.ACTIVE);
    expect(savedVouchers).toHaveLength(1);

    const deposit = savedTransactions.find(
      (tx) => tx.sourceType === TransactionSourceType.USER_DEPOSIT,
    );
    const reward = savedTransactions.find(
      (tx) => tx.sourceType === TransactionSourceType.SYSTEM_REWARD,
    );
    expect(deposit).toMatchObject({
      amount: 50,
      realAmountDelta: 50,
      rewardAmountDelta: 0,
    });
    expect(reward).toMatchObject({
      amount: 50,
      realAmountDelta: 0,
      rewardAmountDelta: 50,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.ISSUED,
      expect.objectContaining({
        kind: 'coupon_voucher',
        code: issued.code,
        instrumentId: issued.id,
        userId: 'user-1',
        amount: 100,
        source: 'purchase',
      }),
    );
    expect(digitalValueService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'voucher',
        code: issued.code,
        initialValue: 100,
        ownerId: 'user-1',
      }),
      'user-1',
      expect.anything(),
    );
  });

  it('is idempotent on the payment transaction id', async () => {
    const existing = voucher({ id: 'uv-existing' });
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return { id: 'ph-1' };
        if (entity === UserVoucher) return existing;
        return null;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    const result = await service.purchaseVoucher('user-1', {
      rewardDefinitionId: 'def-1',
      paymentAmount: 50,
      transactionId: 'pi_replay',
      paymentGateway: PaymentGateway.STRIPE,
    });

    expect(result).toBe(existing);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('rejects an inactive reward definition', async () => {
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        if (entity === RewardDefinition) {
          return {
            id: 'def-1',
            isActive: false,
            functionalType: 'spending_power',
            faceValue: null,
            maxCashbackPercent: 50,
            splitRatio: { real: 0.5, reward: 0.5 },
          };
        }
        return null;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(
      service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 50,
        transactionId: 'pi_1',
        paymentGateway: PaymentGateway.STRIPE,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('uses the canonical face value when the definition provides one', async () => {
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        if (entity === RewardDefinition) {
          return {
            id: 'def-1',
            isActive: true,
            functionalType: 'spending_power',
            faceValue: 100,
            maxCashbackPercent: 50,
            splitRatio: { real: 0.5, reward: 0.5 },
          };
        }
        return null;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager, { functionalType: true });

    const issued = await service.purchaseVoucher('user-1', {
      rewardDefinitionId: 'def-1',
      paymentAmount: 50,
      transactionId: 'pi_face',
      paymentGateway: PaymentGateway.STRIPE,
    });

    expect(issued.faceValue).toBe(100);
    expect(issued.realBalance).toBe(50);
    expect(issued.rewardBalance).toBe(50);
    expect(issued.functionalType).toBe('spending_power');
  });

  it('rejects a payment that does not match the face value', async () => {
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        if (entity === RewardDefinition) {
          return {
            id: 'def-1',
            isActive: true,
            functionalType: 'spending_power',
            faceValue: 100,
            maxCashbackPercent: 50,
            splitRatio: { real: 0.5, reward: 0.5 },
          };
        }
        return null;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager, { functionalType: true });

    await expect(
      service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 60,
        transactionId: 'pi_wrong',
        paymentGateway: PaymentGateway.STRIPE,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects purchasing a price-reducer definition', async () => {
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        if (entity === RewardDefinition) {
          return {
            id: 'def-1',
            isActive: true,
            functionalType: 'price_reducer',
            faceValue: 100,
            maxCashbackPercent: 50,
            splitRatio: { real: 0.5, reward: 0.5 },
          };
        }
        return null;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager, { functionalType: true });

    await expect(
      service.purchaseVoucher('user-1', {
        rewardDefinitionId: 'def-1',
        paymentAmount: 50,
        transactionId: 'pi_reducer',
        paymentGateway: PaymentGateway.STRIPE,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('MoneyEngineService.injectCashback', () => {
  it('credits the reward balance and records the contributor', async () => {
    const target = voucher({ realBalance: 10, rewardBalance: 10 });
    const savedTransactions: VoucherTransaction[] = [];
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === Business) {
          return { id: 'shop-1', user: { id: 'owner-1' } };
        }
        return target;
      }),
      save: jest.fn(async (value: any) => {
        if (value instanceof VoucherTransaction) savedTransactions.push(value);
        return value;
      }),
    };
    const { service, eventEmitter } = buildService(manager);

    const result = await service.injectCashback(
      {
        userVoucherId: target.id,
        amount: 5,
        shopId: 'shop-1',
      } as any,
      { id: 'owner-1', role: 'owner' } as any,
    );

    expect(result.rewardBalance).toBe(15);
    expect(result.realBalance).toBe(10);
    expect(savedTransactions[0]).toMatchObject({
      sourceType: TransactionSourceType.BUSINESS_CASHBACK,
      contributorId: 'shop-1',
      amount: 5,
      rewardAmountDelta: 5,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.CREDITED,
      expect.objectContaining({
        kind: 'coupon_voucher',
        businessId: 'shop-1',
        amount: 5,
        source: 'cashback',
      }),
    );
  });

  it('rejects cashback above the configured cap', async () => {
    const target = voucher({
      realBalance: 50,
      rewardBalance: 40,
      faceValue: 100,
      cashbackCredited: 40,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        maxCashbackPercent: 50,
      },
    });
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === Business) {
          return { id: 'shop-1', user: { id: 'owner-1' } };
        }
        return target;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service, eventEmitter } = buildService(manager, {
      cashbackCap: true,
    });

    await expect(
      service.injectCashback(
        {
          userVoucherId: target.id,
          amount: 20,
          shopId: 'shop-1',
        } as any,
        { id: 'owner-1', role: 'owner' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.REJECTED,
      expect.objectContaining({
        reason: 'cashback_cap_exceeded',
        source: 'cashback',
      }),
    );
  });
});

describe('MoneyEngineService.spend', () => {
  it('burns reward first when the definition says so', async () => {
    const target = voucher({
      realBalance: 10,
      rewardBalance: 20,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REWARD_FIRST,
      },
    });
    const savedTransactions: VoucherTransaction[] = [];
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => {
        if (value instanceof VoucherTransaction) savedTransactions.push(value);
        return value;
      }),
    };
    const { service, eventEmitter, digitalValueService } =
      buildService(manager);

    const result = await service.spend({
      userVoucherId: target.id,
      amount: 15,
      shopId: 'shop-1',
    } as any, { id: 'user-1', role: 'customer' } as any);

    expect(result.realBalance).toBe(10);
    expect(result.rewardBalance).toBe(5);
    expect(result.state).toBe(VoucherState.ACTIVE);
    expect(savedTransactions[0]).toMatchObject({
      sourceType: TransactionSourceType.SPEND,
      amount: -15,
      rewardAmountDelta: -15,
    });
    expect(Math.abs(savedTransactions[0].realAmountDelta)).toBe(0);
    expect(savedTransactions[0]).toMatchObject({
      salesImpactBefore: 0,
      salesImpactAfter: 15,
    });
    expect(result.salesAttributed).toBe(15);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.APPLIED,
      expect.objectContaining({
        kind: 'coupon_voucher',
        businessId: 'shop-1',
        amount: 15,
        source: 'spend',
      }),
    );
    expect(digitalValueService.getByCode).toHaveBeenCalledWith(target.code);
    expect(digitalValueService.redeem).toHaveBeenCalledWith(
      'dv-1',
      { amount: 15 },
      expect.anything(),
    );
  });

  it('carries the cumulative sales baseline across spends', async () => {
    const target = voucher({
      realBalance: 20,
      rewardBalance: 10,
      salesAttributed: 15,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
      },
    });
    const savedTransactions: VoucherTransaction[] = [];
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => {
        if (value instanceof VoucherTransaction) savedTransactions.push(value);
        return value;
      }),
    };
    const { service } = buildService(manager);

    const result = await service.spend({
      userVoucherId: target.id,
      amount: 5,
      shopId: 'shop-1',
    } as any, { id: 'user-1', role: 'customer' } as any);

    expect(result.salesAttributed).toBe(20);
    expect(savedTransactions[0]).toMatchObject({
      salesImpactBefore: 15,
      salesImpactAfter: 20,
    });
  });

  it('burns real first when the definition says so', async () => {
    const target = voucher({
      realBalance: 20,
      rewardBalance: 10,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
      },
    });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    const result = await service.spend({
      userVoucherId: target.id,
      amount: 15,
      shopId: 'shop-1',
    } as any, { id: 'user-1', role: 'customer' } as any);

    expect(result.realBalance).toBe(5);
    expect(result.rewardBalance).toBe(10);
  });

  it('depletes the wallet when the balance reaches zero', async () => {
    const target = voucher({
      realBalance: 10,
      rewardBalance: 5,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
      },
    });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    const result = await service.spend({
      userVoucherId: target.id,
      amount: 15,
      shopId: 'shop-1',
    } as any, { id: 'user-1', role: 'customer' } as any);

    expect(result.state).toBe(VoucherState.DEPLETED);
  });

  it('rejects a spend above the balance and emits a rejection', async () => {
    const target = voucher({ realBalance: 5, rewardBalance: 5 });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
    };
    const { service, eventEmitter } = buildService(manager);

    await expect(
      service.spend({
        userVoucherId: target.id,
        amount: 11,
        shopId: 'shop-1',
      } as any, { id: 'user-1', role: 'customer' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.REJECTED,
      expect.objectContaining({
        kind: 'coupon_voucher',
        reason: 'insufficient_funds',
        source: 'spend',
      }),
    );
  });

  it('rejects an inactive wallet', async () => {
    const target = voucher({ state: VoucherState.EXPIRED });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(
      service.spend({
        userVoucherId: target.id,
        amount: 1,
        shopId: 'shop-1',
      } as any, { id: 'user-1', role: 'customer' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects spending a price-reducer wallet when enforcement is on', async () => {
    const target = voucher({
      realBalance: 10,
      rewardBalance: 10,
      functionalType: 'price_reducer',
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        functionalType: 'price_reducer',
      },
    });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
    };
    const { service, eventEmitter } = buildService(manager, {
      functionalType: true,
    });

    await expect(
      service.spend({
        userVoucherId: target.id,
        amount: 5,
        shopId: 'shop-1',
      } as any, { id: 'user-1', role: 'customer' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.REJECTED,
      expect.objectContaining({
        reason: 'price_reducer_requires_discount_path',
        source: 'spend',
      }),
    );
  });
});

describe('MoneyEngineService.transfer', () => {
  it('moves value while preserving the real/reward ratio', async () => {
    const from = voucher({
      id: 'uv-from',
      code: 'FROM12345678',
      realBalance: 50,
      rewardBalance: 50,
    });
    const to = voucher({
      id: 'uv-to',
      code: 'TO1234567890',
      realBalance: 0,
      rewardBalance: 0,
    });
    const savedTransactions: VoucherTransaction[] = [];
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(from)
        .mockResolvedValueOnce(to),
      save: jest.fn(async (value: any) => {
        const rows = Array.isArray(value) ? value : [value];
        for (const row of rows) {
          if (row instanceof VoucherTransaction) savedTransactions.push(row);
        }
        return value;
      }),
    };
    const { service, eventEmitter } = buildService(manager);

    await service.transfer(from.id, to.id, 40, { id: 'user-1', role: 'customer' } as any);

    expect(from.realBalance).toBe(30);
    expect(from.rewardBalance).toBe(30);
    expect(to.realBalance).toBe(20);
    expect(to.rewardBalance).toBe(20);
    expect(savedTransactions).toHaveLength(2);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.TRANSFERRED,
      expect.objectContaining({
        kind: 'money_voucher',
        instrumentId: from.id,
        amount: 40,
        source: 'transfer',
      }),
    );
  });

  it('rejects a transfer above the source balance', async () => {
    const from = voucher({ realBalance: 5, rewardBalance: 5 });
    const to = voucher({ id: 'uv-to' });
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(from)
        .mockResolvedValueOnce(to),
      save: jest.fn(async (value: any) => value),
    };
    const { service, eventEmitter } = buildService(manager);

    await expect(service.transfer(from.id, to.id, 11, { id: 'user-1', role: 'customer' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.REJECTED,
      expect.objectContaining({
        reason: 'insufficient_funds',
        source: 'transfer',
      }),
    );
  });

  it('rejects a transfer to a missing wallet', async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(service.transfer('a', 'b', 1, { id: 'user-1', role: 'customer' } as any)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('MoneyEngineService.redeemForOrder', () => {
  it('deducts the wallet and writes a spend transaction', async () => {
    const target = voucher({
      realBalance: 10,
      rewardBalance: 10,
      owner: { id: 'user-1' },
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
      },
    });
    const savedTransactions: VoucherTransaction[] = [];
    const voucherRepo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(target)
        .mockResolvedValueOnce(target),
      save: jest.fn(async (value: any) => value),
    };
    const transactionRepo = {
      save: jest.fn(async (value: any) => {
        savedTransactions.push(value);
        return value;
      }),
    };
    const manager = {
      getRepository: jest.fn((entity: any) =>
        entity === UserVoucher ? voucherRepo : transactionRepo,
      ),
    };
    const { service, eventEmitter } = buildService(manager);

    const result = await service.redeemForOrder(
      { code: target.code, amount: 5, userId: 'user-1' },
      { id: 'order-1' },
    );

    expect(result.voucher.realBalance).toBe(5);
    expect(result.voucher.rewardBalance).toBe(10);
    expect(result.realDeduction).toBe(5);
    expect(result.rewardDeduction).toBe(0);
    expect(savedTransactions[0]).toMatchObject({
      sourceType: TransactionSourceType.SPEND,
      amount: -5,
      realAmountDelta: -5,
      referenceId: 'order-1',
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.APPLIED,
      expect.objectContaining({
        kind: 'coupon_voucher',
        source: 'checkout',
        amount: 5,
      }),
    );
  });

  it('rejects a wallet owned by someone else', async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValue({
        id: 'uv-1',
        code: 'OTHER1234567',
        owner: { id: 'other-user' },
        state: VoucherState.ACTIVE,
        realBalance: 10,
        rewardBalance: 0,
        definition: { scopeType: ScopeType.ANY_SHOP },
      }),
    };
    const { service } = buildService(manager);

    await expect(
      service.getOwnedByCode('OTHER1234567', { id: 'user-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('MoneyEngineService.getScopeForDefinition', () => {
  const { service } = buildService({});

  it('returns null for any_shop', () => {
    expect(
      service.getScopeForDefinition({
        scopeType: ScopeType.ANY_SHOP,
      } as any),
    ).toBeNull();
  });

  it('maps specific_shops to a listing scope', () => {
    expect(
      service.getScopeForDefinition({
        scopeType: ScopeType.SPECIFIC_SHOPS,
        validShops: [{ id: 'business-1' }],
      } as any),
    ).toEqual({
      mode: 'LISTINGS',
      businessId: null,
      listingIds: ['business-1'],
      productIds: [],
      serviceIds: [],
    });
  });

  it('fails closed when a restricted definition has no listings', () => {
    expect(() =>
      service.getScopeForDefinition({
        scopeType: ScopeType.SPECIFIC_SHOPS,
        validShops: [],
      } as any),
    ).toThrow(UnprocessableEntityException);
  });
});

describe('MoneyEngineService.contributeToVoucher', () => {
  it('credits the wallet and records the contributor', async () => {
    const target = voucher({
      realBalance: 30,
      rewardBalance: 20,
      faceValue: 100,
      owner: { id: 'owner-1' },
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        faceValue: 100,
      },
    });
    const savedTransactions: VoucherTransaction[] = [];
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        return target;
      }),
      save: jest.fn(async (value: any) => {
        if (value instanceof VoucherTransaction) savedTransactions.push(value);
        return value;
      }),
    };
    const { service, eventEmitter, digitalValueService } =
      buildService(manager);

    const result = await service.contributeToVoucher(
      target.code,
      {
        amount: 20,
        paymentGateway: PaymentGateway.STRIPE,
        transactionId: 'pi_contrib',
      },
      { id: 'friend-1' } as any,
    );

    expect(result.realBalance).toBe(50);
    expect(result.rewardBalance).toBe(20);
    expect(savedTransactions[0]).toMatchObject({
      sourceType: TransactionSourceType.USER_DEPOSIT,
      contributorId: 'friend-1',
      amount: 20,
      realAmountDelta: 20,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      INSTRUMENT_EVENTS.CREDITED,
      expect.objectContaining({
        kind: 'coupon_voucher',
        source: 'contribution',
        amount: 20,
      }),
    );
    expect(digitalValueService.fund).toHaveBeenCalledWith(
      'dv-1',
      { amount: 20 },
      expect.anything(),
    );
  });

  it('rejects a contribution above the face-value target', async () => {
    const target = voucher({
      realBalance: 90,
      rewardBalance: 10,
      faceValue: 100,
      owner: { id: 'owner-1' },
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        faceValue: 100,
      },
    });
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return null;
        return target;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service, paymentOrchestrator } = buildService(manager);

    await expect(
      service.contributeToVoucher(
        target.code,
        {
          amount: 20,
          paymentGateway: PaymentGateway.STRIPE,
          transactionId: 'pi_over',
        },
        { id: 'friend-1' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(paymentOrchestrator.refundCharge).toHaveBeenCalledWith(
      'pi_over',
      20,
    );
  });

  it('is idempotent on the payment transaction id', async () => {
    const target = voucher({
      realBalance: 50,
      rewardBalance: 50,
      faceValue: 100,
      owner: { id: 'owner-1' },
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        faceValue: 100,
      },
    });
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === PaymentHistory) return { id: 'ph-1' };
        return target;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    const result = await service.contributeToVoucher(
      target.code,
      {
        amount: 20,
        paymentGateway: PaymentGateway.STRIPE,
        transactionId: 'pi_replay',
      },
      { id: 'friend-1' } as any,
    );

    expect(result).toBe(target);
    expect(manager.save).not.toHaveBeenCalled();
  });
});

describe('MoneyEngineService.initiateContribution', () => {
  it('creates a payment intent for a valid contribution', async () => {
    const target = voucher({
      realBalance: 30,
      rewardBalance: 20,
      faceValue: 100,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        faceValue: 100,
      },
    });
    const manager = { findOne: jest.fn().mockResolvedValue(target) };
    const { service } = buildService(manager);

    const result = await service.initiateContribution(
      target.code,
      { amount: 20, paymentGateway: PaymentGateway.STRIPE },
      { id: 'friend-1', centralUserId: 'central-1' } as any,
    );

    expect(result).toMatchObject({
      provider: PaymentGateway.STRIPE,
      clientSecret: 'secret',
    });
  });

  it('rejects an over-target contribution before charging', async () => {
    const target = voucher({
      realBalance: 90,
      rewardBalance: 10,
      faceValue: 100,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.ANY_SHOP,
        burnStrategy: BurnStrategy.REAL_FIRST,
        faceValue: 100,
      },
    });
    const manager = { findOne: jest.fn().mockResolvedValue(target) };
    const { service, paymentOrchestrator } = buildService(manager);

    await expect(
      service.initiateContribution(
        target.code,
        { amount: 20, paymentGateway: PaymentGateway.STRIPE },
        { id: 'friend-1', centralUserId: 'central-1' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(paymentOrchestrator.initiate).not.toHaveBeenCalled();
  });
});
