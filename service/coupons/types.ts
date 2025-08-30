export interface Coupon {
  id: string;
  code: string;
  description?: string;
  widgetBackgroundUrl?: string;
  type: 'percentage' | 'fixed';
  amount: number;
  expiryDate: string;
  minSpend?: number;
  maxSpend?: number;
  individualUseOnly: boolean;
  allowedEmails?: string;
  usageLimitPerCoupon?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  businessIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponDto {
  couponCode: string;
  couponDescription?: string;
  widgetBackgroundUrl?: string;
  discountType: 'percentage' | 'fixed';
  couponAmount: number;
  expiryDate: string;
  minSpend?: number;
  maxSpend?: number;
  products?: string;
  individualUseOnly?: boolean;
  allowedEmails?: string;
  usageLimitPerCoupon?: number;
  usageLimitPerUser?: number;
  businessIds: string[];
}

export type UpdateCouponDto = Partial<CreateCouponDto>;
