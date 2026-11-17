/**
 * Cross-cutting instrument telemetry.
 *
 * Every domain that issues, applies, credits or rejects a coupon/voucher/gift
 * card emits one of these events. Keeping the names and payload shape in one
 * place lets the audit pipeline reason about all instruments the same way,
 * even while the underlying ledgers are still separate.
 */

export const INSTRUMENT_EVENTS = {
  /** A new instrument was created (purchase, issuance, partner delivery). */
  ISSUED: 'instrument.issued',
  /** Value was added to an existing instrument (cashback, top-up, reload). */
  CREDITED: 'instrument.credited',
  /** Value was consumed (checkout, POS spend, booking). */
  APPLIED: 'instrument.applied',
  /** Value moved between two instruments. */
  TRANSFERRED: 'instrument.transferred',
  /** An operation was refused. Always carries a `reason`. */
  REJECTED: 'instrument.rejected',
} as const;

export type InstrumentEventType =
  (typeof INSTRUMENT_EVENTS)[keyof typeof INSTRUMENT_EVENTS];

/**
 * Canonical instrument kinds. `coupon` is discount-only; `coupon_voucher` is a
 * spending wallet; `voucher_coupon` is a single-use discount entitlement.
 */
export type InstrumentKind =
  | 'coupon'
  | 'coupon_voucher'
  | 'voucher_coupon'
  | 'voucher'
  | 'gift_card'
  | 'money_voucher';

export interface InstrumentEventPayload {
  kind: InstrumentKind;
  /** Public code, when one exists. */
  code?: string;
  /** Internal row id. */
  instrumentId?: string;
  /** Mall user the instrument belongs to. */
  userId?: string;
  /** Business/shop the operation is bound to. */
  businessId?: string;
  /** Amount in pounds, already rounded by the caller. */
  amount?: number;
  currency?: string;
  /** Machine-readable rejection reason, e.g. `insufficient_funds`. */
  reason?: string;
  /** Origin of the operation, e.g. `checkout`, `pos`, `partner`. */
  source?: string;
  metadata?: Record<string, unknown>;
}
