/**
 * Shared enums for partner-issued instruments and their reward scope.
 *
 * These are intentionally separate from the native mall enums so that the
 * partner concept can evolve without changing the behaviour of native
 * gift cards, vouchers, and coupons.
 */

export enum InstrumentType {
  GIFT_CARD = 'GIFT_CARD',
  VOUCHER = 'VOUCHER',
  COUPON = 'COUPON',
}

export enum ScopeMode {
  /** All products/services, optionally bounded to one business. */
  ALL = 'ALL',
  /** Everything inside the selected listings (businesses). */
  LISTINGS = 'LISTINGS',
  /** Only the selected product/service ids. */
  ITEMS = 'ITEMS',
  /** Legacy unrestricted behaviour. */
  NO_SCOPE = 'NO_SCOPE',
}

/** A line presented to the scope matcher during checkout/booking. */
export type ScopeLineKind = 'product' | 'service';

export interface ScopeLine {
  lineKey: string;
  kind: ScopeLineKind;
  id: string;
  businessId: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  /** Discount already applied to this line (rewards/coupons). */
  discount?: number;
}

export enum PartnerInstrumentOperation {
  REDEEM = 'REDEEM',
  REVOKE = 'REVOKE',
}

export enum PartnerOutboxStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DEAD = 'DEAD',
}

export const PARTNER_INSTRUMENT_CONSUMED_EVENT =
  'partner.instrument.consumed';
