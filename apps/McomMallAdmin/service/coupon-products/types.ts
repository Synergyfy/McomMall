
export interface CouponProduct {
  id: string;
  name: string;
  description: string | null;
  fixedAmounts: number[] | null;
  allowCustomAmount: boolean;
  minCustomAmount: number | null;
  maxCustomAmount: number | null;
  allowReloading: boolean;
  bonusThreshold: number | null;
  bonusAmount: number | null;
  isEnabled: boolean;
  expiryDays: number | null;
  backgroundImage: string | null;
  logoUrl: string | null;
  textColor: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: any; // The business owner
}

export interface CreateCouponProductDto {
  name: string;
  description?: string;
  fixedAmounts?: number[];
  allowCustomAmount?: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  allowReloading?: boolean;
  bonusThreshold?: number;
  bonusAmount?: number;
  expiryDays?: number;
  backgroundImage?: string;
  logoUrl?: string;
  textColor?: string;
  isEnabled?: boolean;
}

export type UpdateCouponProductDto = Partial<CreateCouponProductDto>;

export interface CouponStats {
  totalSold: number;
  totalRedeemed: number;
  outstandingLiability: number;
  activeCoupons: number;
}

export interface CouponChartDataItem {
  month: string;
  sales: number;
  redemptions: number;
}

export interface CouponChartData {
  data: CouponChartDataItem[];
}

export interface CouponTransaction {
  id: string;
  type: 'PURCHASE' | 'REDEEM' | 'REFUND';
  amount: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  couponCode: string;
  notes?: string;
}
