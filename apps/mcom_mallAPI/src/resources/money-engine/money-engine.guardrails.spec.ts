import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { MoneyEngineService } from './money-engine.service';
import {
  BurnStrategy,
  FunctionalType,
  RewardDefinition,
  ScopeType,
  VisualType,
} from './entities/reward-definition.entity';
import { UserVoucher, VoucherState } from './entities/user-voucher.entity';
import {
  TransactionSourceType,
  VoucherTransaction,
} from './entities/voucher-transaction.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';

function buildService(manager: any) {
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
  const featureFlags = {
    isMoneyVoucherCheckoutEnabled: jest.fn(() => true),
    isDealsHubEnabled: jest.fn(() => true),
    isCashbackCapEnabled: jest.fn(() => true),
    isFunctionalTypeEnforcementEnabled: jest.fn(() => true),
    isLedgerConsolidationEnabled: jest.fn(() => true),
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
    eventEmitter as any,
    featureFlags as any,
    digitalValueService as any,
  );
  return { service, manager, eventEmitter, digitalValueService };
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

function priceReducerDefinition(overrides: Record<string, any> = {}) {
  return {
    id: 'def-pr',
    name: '£20 Voucher Coupon',
    isActive: true,
    visualType: VisualType.VOUCHER,
    functionalType: FunctionalType.PRICE_REDUCER,
    faceValue: 20,
    maxCashbackPercent: 50,
    splitRatio: { real: 0.5, reward: 0.5 },
    burnStrategy: BurnStrategy.REAL_FIRST,
    scopeType: ScopeType.ANY_SHOP,
    validShops: [],
    expiresAt: null,
    ...overrides,
  };
}

describe('MoneyEngine guardrails', () => {
  it('rejects a customer spending a wallet they do not own', async () => {
    const target = voucher({ owner: { id: 'someone-else' } });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(
      service.spend(
        { userVoucherId: target.id, amount: 5, shopId: 'biz-1' } as any,
        { id: 'attacker', role: 'customer' } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a business injecting cashback into another business', async () => {
    const target = voucher({ realBalance: 10, rewardBalance: 10 });
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === Business) {
          return { id: 'biz-1', user: { id: 'other-owner' } };
        }
        return target;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(
      service.injectCashback(
        { userVoucherId: target.id, amount: 2, shopId: 'biz-1' } as any,
        { id: 'attacker-owner', role: 'owner' } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects transferring from a wallet the caller does not own', async () => {
    const from = voucher({ owner: { id: 'someone-else' } });
    const to = voucher({ id: 'uv-to' });
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(from)
        .mockResolvedValueOnce(to)
        .mockResolvedValueOnce(from),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(
      service.transfer(from.id, to.id, 5, {
        id: 'attacker',
        role: 'customer',
      } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects spending an expired wallet', async () => {
    const target = voucher({
      realBalance: 10,
      expiresAt: new Date(Date.now() - 60_000),
    });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      })),
    };
    const { service } = buildService(manager);

    await expect(
      service.spend(
        { userVoucherId: target.id, amount: 5, shopId: 'biz-1' } as any,
        { id: 'user-1', role: 'customer' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enforces campaign-only scope at POS (fail closed)', async () => {
    const target = voucher({
      realBalance: 10,
      definition: {
        id: 'def-1',
        scopeType: ScopeType.CAMPAIGN_ONLY,
        burnStrategy: BurnStrategy.REAL_FIRST,
        functionalType: FunctionalType.SPENDING_POWER,
        validShops: [{ id: 'biz-allowed' }],
      },
    });
    const manager = {
      findOne: jest.fn(async (entity: any) => {
        if (entity === Business) {
          return { id: 'biz-other', user: { id: 'user-1' } };
        }
        return target;
      }),
      save: jest.fn(async (value: any) => value),
    };
    const { service } = buildService(manager);

    await expect(
      service.posSpend(
        { userVoucherId: target.id, amount: 5, shopId: 'biz-other' } as any,
        { id: 'user-1', role: 'owner' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps product/service allow-lists to an ITEMS scope', () => {
    const { service } = buildService({});
    expect(
      service.getScopeForDefinition({
        scopeType: ScopeType.ANY_SHOP,
        validProductIds: ['p-1'],
        validServiceIds: [],
      } as any),
    ).toEqual({
      mode: 'ITEMS',
      businessId: null,
      listingIds: [],
      productIds: ['p-1'],
      serviceIds: [],
    });
  });

  it('resolves a Voucher Coupon entitlement capped by the eligible subtotal', async () => {
    const target = voucher({
      functionalType: FunctionalType.PRICE_REDUCER,
      faceValue: 20,
      definition: priceReducerDefinition(),
    });
    const manager = {
      findOne: jest.fn().mockResolvedValue(target),
      save: jest.fn(async (value: any) => value),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      })),
    };
    const { service } = buildService(manager);

    const resolved = await service.resolvePriceReducer(
      target.code,
      { id: 'user-1' },
      12,
    );

    expect(resolved.amount).toBe(12);
    expect(resolved.voucher.faceValue).toBe(20);
  });
});

describe('MoneyEngine issuance', () => {
  function issueManager(definition: any, businesses: any[], recipient: any) {
    return {
      findOne: jest.fn(async (entity: any) => {
        if (entity === RewardDefinition) return definition;
        if (entity === User) return recipient;
        if (entity === UserVoucher) return null;
        return null;
      }),
      find: jest.fn(async (entity: any) => {
        if (entity === Business) return businesses;
        return [];
      }),
      save: jest.fn(async (value: any) => {
        if (value instanceof UserVoucher && !value.id) value.id = 'uv-new';
        return value;
      }),
      transaction: jest.fn(),
    };
  }

  it('lets a business issue a scoped Voucher Coupon it owns', async () => {
    const definition = priceReducerDefinition({
      scopeType: ScopeType.SPECIFIC_SHOPS,
      validShops: [{ id: 'biz-1' }],
    });
    const manager = issueManager(
      definition,
      [{ id: 'biz-1' }],
      { id: 'customer-1', email: 'customer@example.com' },
    );
    const { service, eventEmitter } = buildService(manager);

    const issued = await service.issueVoucher(
      {
        rewardDefinitionId: definition.id,
        recipientEmail: 'customer@example.com',
      },
      { id: 'owner-1', role: 'owner' } as any,
    );

    expect(issued.functionalType).toBe(FunctionalType.PRICE_REDUCER);
    expect(issued.faceValue).toBe(20);
    expect(issued.rewardBalance).toBe(0);
    expect(issued.realBalance).toBe(0);
    expect(issued.realContributionTarget).toBe(0);
    expect(issued.issuerBusinessId).toBe('biz-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'instrument.issued',
      expect.objectContaining({ kind: 'voucher_coupon', amount: 20 }),
    );
  });

  it('refuses a business issuing a scoped Voucher Coupon it does not own', async () => {
    const definition = priceReducerDefinition({
      scopeType: ScopeType.SPECIFIC_SHOPS,
      validShops: [{ id: 'biz-other' }],
    });
    const manager = issueManager(
      definition,
      [{ id: 'biz-mine' }],
      { id: 'customer-1', email: 'customer@example.com' },
    );
    const { service } = buildService(manager);

    await expect(
      service.issueVoucher(
        {
          rewardDefinitionId: definition.id,
          recipientEmail: 'customer@example.com',
        },
        { id: 'owner-1', role: 'owner' } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses a business minting a funded spending-power wallet', async () => {
    const definition = priceReducerDefinition({
      functionalType: FunctionalType.SPENDING_POWER,
    });
    const manager = issueManager(
      definition,
      [{ id: 'biz-1' }],
      { id: 'customer-1', email: 'customer@example.com' },
    );
    const { service } = buildService(manager);

    await expect(
      service.issueVoucher(
        {
          rewardDefinitionId: definition.id,
          recipientEmail: 'customer@example.com',
        },
        { id: 'owner-1', role: 'owner' } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets an admin issue a partially funded spending-power wallet', async () => {
    const definition = priceReducerDefinition({
      functionalType: FunctionalType.SPENDING_POWER,
      faceValue: 100,
      splitRatio: { real: 0.5, reward: 0.5 },
    });
    const manager = issueManager(
      definition,
      [],
      { id: 'customer-1', email: 'customer@example.com' },
    );
    const { service } = buildService(manager);

    const issued = await service.issueVoucher(
      {
        rewardDefinitionId: definition.id,
        recipientEmail: 'customer@example.com',
      },
      { id: 'admin-1', role: 'admin' } as any,
    );

    expect(issued.functionalType).toBe(FunctionalType.SPENDING_POWER);
    expect(issued.realBalance).toBe(0);
    expect(issued.rewardBalance).toBe(50);
    expect(issued.realContributionTarget).toBe(50);
  });
});

describe('Voucher Coupon redemption', () => {
  it('consumes the entitlement once and records the reference', async () => {
    const target = voucher({
      functionalType: FunctionalType.PRICE_REDUCER,
      faceValue: 20,
      definition: priceReducerDefinition(),
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

    const result = await service.redeemPriceReducer(
      {
        code: target.code,
        amount: 15,
        userId: 'user-1',
        businessId: 'biz-1',
        referenceId: 'order-1',
        source: 'checkout',
      },
      manager as any,
    );

    expect(result.amount).toBe(15);
    expect(result.voucher.state).toBe(VoucherState.DEPLETED);
    expect(savedTransactions[0]).toMatchObject({
      sourceType: TransactionSourceType.SPEND,
      businessId: 'biz-1',
      referenceId: 'order-1',
      amount: -15,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'instrument.applied',
      expect.objectContaining({ kind: 'voucher_coupon', amount: 15 }),
    );
  });
});
