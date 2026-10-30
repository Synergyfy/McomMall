import { round2 } from './instrument-scope.service';

export interface CouponMathInput {
  discountType: 'fixed' | 'percentage' | string;
  discountValue: number;
  base: number;
  maxDiscount?: number | null;
}

/**
 * Single source of truth for coupon maths. Fixed discounts are capped at the
 * eligible base; percentage discounts are capped by `maxDiscount` when set.
 * Always returns a non-negative, 2dp amount.
 */
export function computeCouponDiscount(input: CouponMathInput): number {
  const base = Math.max(0, round2(input.base));
  const value = Number(input.discountValue) || 0;
  let amount: number;

  if (String(input.discountType).toLowerCase().includes('percent')) {
    amount = base * (value / 100);
    const cap = Number(input.maxDiscount);
    if (Number.isFinite(cap) && cap > 0) {
      amount = Math.min(amount, cap);
    }
  } else {
    amount = Math.min(base, value);
  }

  return round2(Math.max(0, amount));
}

export interface InstrumentApplicationInput {
  /** Amount the shopper asked to apply, if any. */
  requested?: number | null;
  /** Remaining instrument balance. */
  balance: number;
  /** Maximum the scope allows this instrument to pay. */
  eligiblePayable: number;
  /** Remaining payable after earlier instruments (never exceeded). */
  remainingPayable: number;
}

/**
 * `min(requested ?? balance, balance, eligiblePayable, remainingPayable)` with
 * 2dp rounding and a hard floor of zero.
 */
export function computeInstrumentApplication(
  input: InstrumentApplicationInput,
): number {
  const balance = Math.max(0, round2(input.balance));
  const eligible = Math.max(0, round2(input.eligiblePayable));
  const remaining = Math.max(0, round2(input.remainingPayable));
  const requested =
    input.requested === null || input.requested === undefined
      ? balance
      : Math.max(0, round2(input.requested));

  return round2(Math.max(0, Math.min(requested, balance, eligible, remaining)));
}
