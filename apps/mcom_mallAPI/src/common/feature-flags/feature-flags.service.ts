import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Env-backed feature flags for the coupon-voucher alignment work.
 *
 * Money-engine flags default to `true`; each flag can still be turned off per
 * environment while a rollout is being verified.
 */
export const FEATURE_FLAG_KEYS = {
  /** Enforce `functionalType` in issuance/spend paths (Phase 1). */
  FUNCTIONAL_TYPE_ENFORCEMENT: 'FEATURE_FUNCTIONAL_TYPE_ENFORCEMENT',
  /** Allow money-engine wallets to pay online orders and bookings (Phase 2). */
  MONEY_VOUCHER_CHECKOUT: 'FEATURE_MONEY_VOUCHER_CHECKOUT',
  /** Expose the aggregated Deals hub / read facade (Phase 4-5). */
  DEALS_HUB: 'FEATURE_DEALS_HUB',
  /** Enforce the per-voucher cashback cap (Phase 1). */
  CASHBACK_CAP: 'FEATURE_CASHBACK_CAP',
  /** Retire legacy balance-bearing coupons and mirror wallets into digital-value (Phase 4b/4c). */
  LEDGER_CONSOLIDATION: 'FEATURE_LEDGER_CONSOLIDATION',
} as const;

export type FeatureFlagKey =
  (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS];

export function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly configService: ConfigService) {}

  isEnabled(key: FeatureFlagKey, fallback = false): boolean {
    return asBool(this.configService.get<string>(key), fallback);
  }

  isFunctionalTypeEnforcementEnabled(): boolean {
    // Enabled by default: a price reducer must never be spendable as a wallet.
    return this.isEnabled(FEATURE_FLAG_KEYS.FUNCTIONAL_TYPE_ENFORCEMENT, true);
  }

  isMoneyVoucherCheckoutEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAG_KEYS.MONEY_VOUCHER_CHECKOUT, true);
  }

  isDealsHubEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAG_KEYS.DEALS_HUB, true);
  }

  isCashbackCapEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAG_KEYS.CASHBACK_CAP, true);
  }

  isLedgerConsolidationEnabled(): boolean {
    // Coupon products are purchasable by default. Set the flag to `true` to
    // retire the legacy balance-bearing coupon path during a migration.
    return this.isEnabled(FEATURE_FLAG_KEYS.LEDGER_CONSOLIDATION, false);
  }

  /** Stable snapshot for audit logs and startup diagnostics. */
  snapshot(): Record<FeatureFlagKey, boolean> {
    return {
      [FEATURE_FLAG_KEYS.FUNCTIONAL_TYPE_ENFORCEMENT]:
        this.isFunctionalTypeEnforcementEnabled(),
      [FEATURE_FLAG_KEYS.MONEY_VOUCHER_CHECKOUT]:
        this.isMoneyVoucherCheckoutEnabled(),
      [FEATURE_FLAG_KEYS.DEALS_HUB]: this.isDealsHubEnabled(),
      [FEATURE_FLAG_KEYS.CASHBACK_CAP]: this.isCashbackCapEnabled(),
      [FEATURE_FLAG_KEYS.LEDGER_CONSOLIDATION]:
        this.isLedgerConsolidationEnabled(),
    };
  }
}
