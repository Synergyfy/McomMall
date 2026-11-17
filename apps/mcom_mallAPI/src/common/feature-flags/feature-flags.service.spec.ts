import { FeatureFlagsService, FEATURE_FLAG_KEYS } from './feature-flags.service';

function build(config: Record<string, string | undefined>): FeatureFlagsService {
  return new FeatureFlagsService({
    get: (key: string) => config[key],
  } as any);
}

describe('FeatureFlagsService', () => {
  it('defaults every money-engine flag to enabled when unset', () => {
    const flags = build({});

    expect(flags.isFunctionalTypeEnforcementEnabled()).toBe(true);
    expect(flags.isMoneyVoucherCheckoutEnabled()).toBe(true);
    expect(flags.isDealsHubEnabled()).toBe(true);
    expect(flags.isCashbackCapEnabled()).toBe(true);
    expect(flags.isLedgerConsolidationEnabled()).toBe(true);
  });

  it('treats only the literal "true" (any case) as enabled', () => {
    const flags = build({
      [FEATURE_FLAG_KEYS.MONEY_VOUCHER_CHECKOUT]: 'TRUE',
      [FEATURE_FLAG_KEYS.DEALS_HUB]: 'yes',
    });

    expect(flags.isMoneyVoucherCheckoutEnabled()).toBe(true);
    expect(flags.isDealsHubEnabled()).toBe(false);
  });

  it('treats an empty string as unset', () => {
    const flags = build({
      [FEATURE_FLAG_KEYS.FUNCTIONAL_TYPE_ENFORCEMENT]: '',
    });

    expect(flags.isFunctionalTypeEnforcementEnabled()).toBe(true);
  });

  it('returns a stable snapshot of every known flag', () => {
    const flags = build({
      [FEATURE_FLAG_KEYS.CASHBACK_CAP]: 'true',
    });

    expect(flags.snapshot()).toEqual({
      [FEATURE_FLAG_KEYS.FUNCTIONAL_TYPE_ENFORCEMENT]: true,
      [FEATURE_FLAG_KEYS.MONEY_VOUCHER_CHECKOUT]: true,
      [FEATURE_FLAG_KEYS.DEALS_HUB]: true,
      [FEATURE_FLAG_KEYS.CASHBACK_CAP]: true,
      [FEATURE_FLAG_KEYS.LEDGER_CONSOLIDATION]: true,
    });
  });
});
