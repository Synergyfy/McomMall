import { RewardsEligibilityService } from './rewards-eligibility.service';
import { EligibilityLine, RewardIssuanceDto } from './interfaces/reward-issuance.interface';

function issuance(overrides: Partial<RewardIssuanceDto> = {}): RewardIssuanceDto {
  return {
    id: 'issuance-1',
    status: 'ISSUED',
    rewardTitle: '20% off',
    rewardType: 'coupon',
    quantity: 1,
    expiresAt: null,
    metadata: {
      mallTargets: {
        scope: 'SPECIFIC',
        businessMcomUserId: 'biz-1',
        productIds: ['prod-1'],
        discountType: 'percentage',
        discountValue: 20,
      },
    },
    ...overrides,
  };
}

function line(overrides: Partial<EligibilityLine> = {}): EligibilityLine {
  return {
    lineKey: 'product:prod-1',
    kind: 'PRODUCT',
    id: 'prod-1',
    businessId: 'mall-biz-1',
    businessMcomUserId: 'biz-1',
    unitPrice: 50,
    quantity: 2,
    ...overrides,
  };
}

describe('RewardsEligibilityService', () => {
  let service: RewardsEligibilityService;

  beforeEach(() => {
    service = new RewardsEligibilityService();
  });

  it('applies a percentage discount to the whole line', () => {
    const result = service.evaluate([issuance()], [line()]);
    expect(result).toHaveLength(1);
    expect(result[0].applicableLines[0]).toEqual({
      lineKey: 'product:prod-1',
      discountAmount: 20, // 20% of (50 x 2)
      capped: false,
    });
  });

  it('applies a fixed discount capped at the line total', () => {
    const result = service.evaluate(
      [
        issuance({
          metadata: {
            mallTargets: {
              scope: 'SPECIFIC',
              productIds: ['prod-1'],
              discountType: 'fixed',
              discountValue: 500,
            },
          },
        }),
      ],
      [line()],
    );
    expect(result[0].applicableLines[0].discountAmount).toBe(100); // capped at line total
  });

  it('honours maxDiscount', () => {
    const result = service.evaluate(
      [
        issuance({
          metadata: {
            mallTargets: {
              scope: 'SPECIFIC',
              productIds: ['prod-1'],
              discountType: 'percentage',
              discountValue: 50,
              maxDiscount: 30,
            },
          },
        }),
      ],
      [line()],
    );
    expect(result[0].applicableLines[0]).toEqual({
      lineKey: 'product:prod-1',
      discountAmount: 30,
      capped: true,
    });
  });

  it('respects the minimum spend', () => {
    const result = service.evaluate(
      [
        issuance({
          metadata: {
            mallTargets: {
              scope: 'SPECIFIC',
              productIds: ['prod-1'],
              discountType: 'percentage',
              discountValue: 20,
              minSpend: 200,
            },
          },
        }),
      ],
      [line()],
    );
    expect(result).toHaveLength(0);
  });

  it('does not apply when the business does not match', () => {
    const result = service.evaluate(
      [issuance()],
      [line({ businessMcomUserId: 'other-biz' })],
    );
    expect(result).toHaveLength(0);
  });

  it('applies business-wide (ALL) targets', () => {
    const result = service.evaluate(
      [
        issuance({
          metadata: {
            mallTargets: {
              scope: 'ALL',
              businessMcomUserId: 'biz-1',
              discountType: 'percentage',
              discountValue: 10,
            },
          },
        }),
      ],
      [line()],
    );
    expect(result[0].applicableLines[0].discountAmount).toBe(10);
  });

  it('matches multiple qualifying lines', () => {
    const result = service.evaluate(
      [
        issuance({
          metadata: {
            mallTargets: {
              scope: 'SPECIFIC',
              businessMcomUserId: 'biz-1',
              productIds: ['prod-1', 'prod-2'],
              discountType: 'percentage',
              discountValue: 20,
            },
          },
        }),
      ],
      [line(), line({ lineKey: 'product:prod-2', id: 'prod-2' })],
    );
    expect(result[0].applicableLines.map((l) => l.lineKey)).toEqual([
      'product:prod-1',
      'product:prod-2',
    ]);
  });

  it('ignores non-ISSUED and expired rewards', () => {
    const expired = new Date(Date.now() - 1000).toISOString();
    expect(
      service.evaluate([issuance({ status: 'REDEEMED' })], [line()]),
    ).toHaveLength(0);
    expect(
      service.evaluate([issuance({ expiresAt: expired })], [line()]),
    ).toHaveLength(0);
  });

  it('ignores rewards without mall targets', () => {
    expect(
      service.evaluate([issuance({ metadata: {} })], [line()]),
    ).toHaveLength(0);
  });
});
