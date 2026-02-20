export enum DigitalValueType {
  GIFT_CARD = 'gift_card',
  VOUCHER = 'voucher',
}

export enum DigitalValueStatus {
  DRAFT = 'draft',
  FUNDED = 'funded',
  ACTIVE = 'active',
  PARTIALLY_REDEEMED = 'partially_redeemed',
  FULLY_REDEEMED = 'fully_redeemed',
  EXPIRED = 'expired',
}

export enum DigitalValueTransactionType {
  FUND = 'fund',
  REDEEM = 'redeem',
  TOP_UP = 'top_up',
}
