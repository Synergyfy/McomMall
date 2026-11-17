import { NotFoundException } from '@nestjs/common';
import { DealsService } from './deals.service';

const coupon = {
  id: 'coupon-1',
  code: 'SAVE10',
  title: 'Save 10',
  description: null,
  discountValue: 10,
  status: 'active',
  expiresAt: null,
  created_at: new Date('2026-01-01T00:00:00Z'),
  business: null,
  metadata: null,
};

const moneyVoucher = {
  id: 'mv-1',
  code: 'MV1',
  realBalance: 50,
  rewardBalance: 50,
  faceValue: 100,
  functionalType: 'spending_power',
  state: 'active',
  created_at: new Date('2026-01-02T00:00:00Z'),
  definition: {
    id: 'def-1',
    name: 'Spring Voucher',
    description: null,
    visualType: 'voucher',
    functionalType: 'spending_power',
    scopeType: 'any_shop',
    validShops: [],
    faceValue: 100,
  },
};

const voucher = {
  id: 'voucher-1',
  code: 'V1',
  initialValue: 25,
  balance: 20,
  status: 'partially_redeemed',
  expiresAt: null,
  createdAt: new Date('2026-01-03T00:00:00Z'),
  business: null,
  voucherProduct: { name: 'Gift Voucher', description: null },
};

const giftCard = {
  id: 'gift-1',
  code: 'G1',
  initialBalance: 50,
  currentBalance: 40,
  isActive: true,
  expiryDate: null,
  personalMessage: null,
  created_at: new Date('2026-01-04T00:00:00Z'),
  purchaseBusiness: null,
  template: { name: 'Gift Card', description: null },
};

function buildService(flagEnabled = true) {
  const couponRepository = {
    find: jest.fn().mockResolvedValue([coupon]),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };
  const savedCouponRepository = {
    find: jest
      .fn()
      .mockResolvedValue([
        { coupon, savedAt: new Date('2026-01-05T00:00:00Z') },
      ]),
  };
  const userVoucherRepository = {
    find: jest.fn().mockResolvedValue([moneyVoucher]),
  };
  const voucherRepository = { find: jest.fn().mockResolvedValue([voucher]) };
  const giftCardRepository = { find: jest.fn().mockResolvedValue([giftCard]) };
  const giftCardTemplateRepository = {
    find: jest.fn().mockResolvedValue([]),
  };
  const campaignRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'campaign-1',
        name: 'Winter Sale',
        status: 'active',
        targetPostalCodes: [],
        endDate: null,
        created_at: new Date('2026-01-06T00:00:00Z'),
      },
    ]),
  };
  const definitionRepository = {
    find: jest.fn().mockResolvedValue([moneyVoucher.definition]),
  };
  const featureFlags = {
    isDealsHubEnabled: jest.fn(() => flagEnabled),
  };
  const instrumentsService = {
    resolve: jest.fn(),
  };

  const service = new DealsService(
    couponRepository as any,
    savedCouponRepository as any,
    userVoucherRepository as any,
    voucherRepository as any,
    giftCardRepository as any,
    giftCardTemplateRepository as any,
    campaignRepository as any,
    definitionRepository as any,
    featureFlags as any,
    instrumentsService as any,
  );

  return {
    service,
    couponRepository,
    savedCouponRepository,
    userVoucherRepository,
    voucherRepository,
    giftCardRepository,
    giftCardTemplateRepository,
    campaignRepository,
    definitionRepository,
    featureFlags,
    instrumentsService,
  };
}

describe('DealsService', () => {
  it('is hidden when the deals hub flag is off', async () => {
    const { service } = buildService(false);

    await expect(service.getMine('user-1', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('aggregates every personal instrument into one shape', async () => {
    const { service } = buildService();

    const result = await service.getMine('user-1', {});

    expect(result.meta.total).toBe(4);
    const kinds = result.data.map((deal) => deal.kind).sort();
    expect(kinds).toEqual([
      'coupon_voucher',
      'gift_card',
      'standard_coupon',
      'voucher',
    ]);
    expect(result.data.find((deal) => deal.source === 'money_voucher')).toMatchObject({
      faceValue: 100,
      remainingValue: 100,
      functionalType: 'spending_power',
    });
  });

  it('filters personal deals by kind', async () => {
    const { service } = buildService();

    const result = await service.getMine('user-1', { kind: 'voucher' });

    expect(result.meta.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      kind: 'voucher',
      code: 'V1',
      remainingValue: 20,
    });
  });

  it('discovers active coupons, definitions and campaigns', async () => {
    const { service } = buildService();

    const result = await service.getAll({});

    const kinds = result.data.map((deal) => deal.kind).sort();
    expect(kinds).toEqual([
      'coupon_voucher',
      'promotion',
      'standard_coupon',
    ]);
    expect(result.data.find((deal) => deal.kind === 'promotion')).toMatchObject({
      title: 'Winter Sale',
      source: 'campaign',
    });
  });

  it('resolves a code through the canonical resolver', async () => {
    const { service, instrumentsService } = buildService();
    instrumentsService.resolve.mockResolvedValue({
      id: 'mv-1',
      code: 'MV1',
      kind: 'coupon_voucher',
      visualType: 'voucher',
      behavior: 'spending_power',
      faceValue: 100,
      balance: 100,
      status: 'active',
      scope: null,
      source: 'money_voucher',
    });

    const deal = await service.resolve('MV1');

    expect(deal).toMatchObject({
      id: 'mv-1',
      kind: 'coupon_voucher',
      code: 'MV1',
      faceValue: 100,
      remainingValue: 100,
      source: 'money_voucher',
    });
  });
});
