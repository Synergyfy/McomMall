export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CouponStatus {
  UNREDEEMED = 'unredeemed',
  REDEEMED = 'redeemed',
  PARTIALLY_REDEEMED = 'partially_redeemed',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  RELOAD = 'reload',
  REDEMPTION = 'redemption',
  REVERSAL = 'reversal',
  REFUND = 'refund',
}
