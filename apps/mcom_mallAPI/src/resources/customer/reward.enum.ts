export enum RewardType {
  COUPON = 'coupon',
  VOUCHER = 'voucher',
  QR = 'qr',
  EVENT = 'event',
  GIFT = 'gift',
  LOYALTY = 'loyalty',
  GAMIFICATION = 'gamification',
  CODE = 'code',
}

export enum RewardRedemptionStatus {
  CLAIMED = 'claimed',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}

export enum SpinPrizeType {
  POINTS = 'points',
  VOUCHER = 'voucher',
  SURPRISE = 'surprise',
}

export enum ScratchPrizeType {
  POINTS = 'points',
  VOUCHER = 'voucher',
  REWARD = 'reward',
  NONE = 'none',
}

export enum ChallengeType {
  SHOP = 'shop',
  VISIT = 'visit',
  STREAK = 'streak',
  CUSTOM = 'custom',
}
