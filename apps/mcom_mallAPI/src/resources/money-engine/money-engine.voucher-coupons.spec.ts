import { MoneyEngineService } from './money-engine.service';
import {
  FunctionalType,
  RewardDefinition,
} from './entities/reward-definition.entity';
import { UserVoucher, VoucherState } from './entities/user-voucher.entity';
import { Business } from '../listings/entities/listing.entity';

function buildService(manager: any) {
  const dataSource = {
    transaction: jest.fn(async (cb: any) => cb(manager)),
    manager,
    query: jest.fn().mockResolvedValue([]),
  };
  const service = new MoneyEngineService(
    dataSource as any,
    {} as any,
    {} as any,
    { emit: jest.fn() } as any,
    {
      isMoneyVoucherCheckoutEnabled: jest.fn(() => true),
      isDealsHubEnabled: jest.fn(() => true),
      isCashbackCapEnabled: jest.fn(() => true),
      isFunctionalTypeEnforcementEnabled: jest.fn(() => true),
      isLedgerConsolidationEnabled: jest.fn(() => true),
    } as any,
    undefined,
  );
  return { service, manager, dataSource };
}

function voucher(overrides: Record<string, any> = {}): UserVoucher {
  const definition = Object.assign(new RewardDefinition(), {
    id: 'def-1',
    name: 'Christmas £10 off',
    description: 'Seasonal discount',
    functionalType: FunctionalType.PRICE_REDUCER,
    scopeType: 'any_shop',
    validShops: [],
  });
  return Object.assign(new UserVoucher(), {
    id: 'uv-1',
    code: 'VOUCHER12345',
    state: VoucherState.ACTIVE,
    functionalType: FunctionalType.PRICE_REDUCER,
    faceValue: 10,
    salesAttributed: 0,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    definition,
    owner: {
      id: 'customer-1',
      email: 'customer@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    },
    ...overrides,
  });
}

describe('MoneyEngineService.getBusinessVoucherCoupons', () => {
  it('returns an empty dashboard when the caller owns no business', async () => {
    const manager = {
      find: jest.fn().mockResolvedValue([]),
      findAndCount: jest.fn(),
    };
    const { service } = buildService(manager);

    const result = await service.getBusinessVoucherCoupons('user-1');

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
    expect(result.stats).toEqual({
      total: 0,
      active: 0,
      redeemed: 0,
      expired: 0,
      totalDiscountIssued: 0,
      totalDiscountRedeemed: 0,
    });
    expect(manager.findAndCount).not.toHaveBeenCalled();
  });

  it('maps issued coupons and computes dashboard stats across all statuses', async () => {
    const active = voucher({ id: 'uv-active', code: 'ACTIVE000001' });
    const redeemed = voucher({
      id: 'uv-redeemed',
      code: 'REDEEM000001',
      state: VoucherState.DEPLETED,
      faceValue: 15,
      salesAttributed: 15,
    });
    const expired = voucher({
      id: 'uv-expired',
      code: 'EXPIRED00001',
      state: VoucherState.ACTIVE,
      expiresAt: new Date('2025-01-01T00:00:00.000Z'),
      faceValue: 5,
    });

    const manager = {
      find: jest.fn(async (entity: unknown) => {
        if (entity === Business) return [{ id: 'biz-1' }];
        return [active, redeemed, expired];
      }),
      findAndCount: jest
        .fn()
        .mockResolvedValue([[active, redeemed, expired], 3]),
    };
    const { service } = buildService(manager);

    const result = await service.getBusinessVoucherCoupons('user-1', {
      status: 'all',
    });

    expect(result.count).toBe(3);
    expect(result.stats).toEqual({
      total: 3,
      active: 1,
      redeemed: 1,
      expired: 1,
      totalDiscountIssued: 30,
      totalDiscountRedeemed: 15,
    });
    expect(result.data.map((row) => row.status)).toEqual([
      'active',
      'redeemed',
      'expired',
    ]);
    expect(result.data[0]).toMatchObject({
      code: 'ACTIVE000001',
      templateName: 'Christmas £10 off',
      faceValue: 10,
      recipientEmail: 'customer@example.com',
      recipientName: 'Ada Lovelace',
    });
  });

  it('only counts the owned business when resolving issuers', async () => {
    const manager = {
      find: jest.fn(async (entity: unknown) => {
        if (entity === Business) return [{ id: 'biz-1' }, { id: 'biz-2' }];
        return [];
      }),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const { service } = buildService(manager);

    await service.getBusinessVoucherCoupons('user-1');

    const findAndCountArgs = manager.findAndCount.mock.calls[0][1];
    expect(findAndCountArgs.where).toMatchObject({
      functionalType: FunctionalType.PRICE_REDUCER,
    });
  });
});
