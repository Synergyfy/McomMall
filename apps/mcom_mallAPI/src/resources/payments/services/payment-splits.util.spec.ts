import {
  allocateCashSplits,
  allocateProRata,
  validateSplitContract,
  WeightedSplit,
} from './payment-splits.util';

describe('payment splits', () => {
  it('allocates every penny with largest-remainder rounding', () => {
    const allocation = allocateProRata(100n, [1n, 1n, 1n]);
    expect(allocation.reduce((sum, part) => sum + part, 0n)).toBe(100n);
    expect(allocation).toEqual([34n, 33n, 33n]);
  });

  it('uses exact entitlements when cash equals the gross total', () => {
    const payees: WeightedSplit[] = [
      {
        key: 'seller-a',
        entitlementMinor: 8_000n,
        split: { payeeType: 'mcom_user', payeeUserId: 'seller-a' },
      },
      {
        key: 'seller-b',
        entitlementMinor: 1_000n,
        split: { payeeType: 'external', payeeExternalId: 'business:b' },
      },
      {
        key: 'platform',
        entitlementMinor: 1_000n,
        split: { payeeType: 'external', payeeExternalId: 'platform' },
      },
    ];

    const result = allocateCashSplits(10_000n, payees, 'platform');
    expect(result.splits).toHaveLength(3);
    expect(result.allocatedMinor.get('seller-a')).toBe(8_000n);
    expect(result.allocatedMinor.get('seller-b')).toBe(1_000n);
    expect(result.allocatedMinor.get('platform')).toBe(1_000n);
  });

  it('reduces every payee proportionally when discounts reduce the cash', () => {
    const payees: WeightedSplit[] = [
      {
        key: 'seller-a',
        entitlementMinor: 6_000n,
        split: { payeeType: 'mcom_user', payeeUserId: 'seller-a' },
      },
      {
        key: 'seller-b',
        entitlementMinor: 2_000n,
        split: { payeeType: 'mcom_user', payeeUserId: 'seller-b' },
      },
      {
        key: 'platform',
        entitlementMinor: 2_000n,
        split: { payeeType: 'external', payeeExternalId: 'platform' },
      },
    ];

    const result = allocateCashSplits(5_000n, payees, 'platform');
    const total = result.splits.reduce(
      (sum, split) => sum + BigInt(split.amountMinor),
      0n,
    );
    expect(total).toBe(5_000n);
    expect(result.allocatedMinor.get('seller-a')).toBe(3_000n);
    expect(result.allocatedMinor.get('seller-b')).toBe(1_000n);
    expect(result.allocatedMinor.get('platform')).toBe(1_000n);
  });

  it('assigns cash above gross entitlements to the platform payee', () => {
    const payees: WeightedSplit[] = [
      {
        key: 'seller-a',
        entitlementMinor: 5_000n,
        split: { payeeType: 'mcom_user', payeeUserId: 'seller-a' },
      },
      {
        key: 'platform',
        entitlementMinor: 0n,
        split: { payeeType: 'external', payeeExternalId: 'platform' },
      },
    ];

    const result = allocateCashSplits(6_000n, payees, 'platform');
    expect(result.allocatedMinor.get('seller-a')).toBe(5_000n);
    expect(result.allocatedMinor.get('platform')).toBe(1_000n);
  });

  it('refuses more than 50 payees rather than dropping a seller', () => {
    const payees: WeightedSplit[] = Array.from({ length: 51 }, (_, index) => ({
      key: `seller-${index}`,
      entitlementMinor: 100n,
      split: { payeeType: 'mcom_user', payeeUserId: `seller-${index}` },
    }));

    const result = allocateCashSplits(5_100n, payees);
    expect(result.splits).toEqual([]);
  });
});

describe('validateSplitContract', () => {
  it('accepts splits that reconcile exactly', () => {
    expect(
      validateSplitContract('9000', [
        { payeeType: 'mcom_user', payeeUserId: 'seller-1', amountMinor: '9000' },
      ]),
    ).toEqual({ ok: true });
  });

  it('accepts a charge without splits', () => {
    expect(validateSplitContract('9000')).toEqual({ ok: true });
    expect(validateSplitContract('9000', [])).toEqual({ ok: true });
  });

  it('rejects a split list that does not sum to the charge', () => {
    const result = validateSplitContract('9000', [
      { payeeType: 'mcom_user', payeeUserId: 'seller-1', amountMinor: '8000' },
    ]);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('SPLIT_SUM_MISMATCH');
  });

  it('rejects non-integer, zero and missing amounts', () => {
    for (const amountMinor of ['10.50', '0', '-1', '']) {
      const result = validateSplitContract('1000', [
        { payeeType: 'mcom_user', payeeUserId: 'seller-1', amountMinor },
      ]);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('MALFORMED_SPLIT');
    }
  });

  it('requires the id that matches the payee type', () => {
    expect(
      validateSplitContract('1000', [
        { payeeType: 'mcom_user', amountMinor: '1000' },
      ]).error,
    ).toBe('MALFORMED_SPLIT');

    expect(
      validateSplitContract('1000', [
        { payeeType: 'external', amountMinor: '1000' },
      ]).error,
    ).toBe('MALFORMED_SPLIT');
  });

  it('rejects duplicate payees and more than 50 splits', () => {
    expect(
      validateSplitContract('2000', [
        { payeeType: 'mcom_user', payeeUserId: 'seller-1', amountMinor: '1000' },
        { payeeType: 'mcom_user', payeeUserId: 'seller-1', amountMinor: '1000' },
      ]).error,
    ).toBe('MALFORMED_SPLIT');

    const tooMany = Array.from({ length: 51 }, (_, index) => ({
      payeeType: 'mcom_user' as const,
      payeeUserId: `seller-${index}`,
      amountMinor: '1',
    }));
    expect(validateSplitContract('51', tooMany).error).toBe('MALFORMED_SPLIT');
  });
});
