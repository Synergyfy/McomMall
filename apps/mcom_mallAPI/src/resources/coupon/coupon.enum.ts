export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CouponStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
  DISABLED = 'disabled', // Keeping for legacy/admin override
}

export enum CouponSourceType {
  PLATFORM = 'platform',
  BUSINESS = 'business',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  RELOAD = 'reload',
  REDEMPTION = 'redemption',
  REVERSAL = 'reversal',
  REFUND = 'refund',
}
