export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  amount: number;
  expiryDate: string;
  minSpend?: number;
  maxSpend?: number;
  individualUseOnly: boolean;
  excludeSaleItems: boolean;
  allowedEmails: string[];
  usageLimitPerCoupon?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateCouponDto = Omit<Coupon, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>;
export type UpdateCouponDto = Partial<CreateCouponDto>;
