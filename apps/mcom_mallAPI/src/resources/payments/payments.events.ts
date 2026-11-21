/**
 * Emitted by the MCOM Pay webhook when a paid charge has no allocation yet but
 * matches a quote-bound checkout intent. The order module listens and completes
 * the order; the webhook awaits the listener so a failure returns 5xx and
 * Central retries.
 */
export const MCOM_PAY_INTENT_PAID = 'MCOM_PAY_INTENT_PAID';

/**
 * Emitted when a paid charge references a booking (`booking-<id>`) and the
 * browser never called `/bookings/verify-payment`. The booking module confirms
 * the booking and releases the provider's local earnings.
 */
export const MCOM_PAY_BOOKING_PAID = 'MCOM_PAY_BOOKING_PAID';

/**
 * Emitted when a paid charge carries a local purchase context (gift card,
 * voucher, coupon, membership, wallet top-up, money voucher, ...). The owning
 * module finishes the purchase using the context frozen at initiation.
 */
export const MCOM_PAY_PURCHASE_PAID = 'MCOM_PAY_PURCHASE_PAID';
