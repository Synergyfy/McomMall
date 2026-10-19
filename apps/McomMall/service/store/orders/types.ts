import { User, Product } from '@/service/listings/types';

export interface OrderItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  selectedVariants: Record<string, string> | null;
  quantity: number;
  price: string;
  product: Product;
}

export interface OrderRewardRedemption {
  id: string;
  rewardIssuanceId: string;
  rewardType?: string | null;
  targetType?: 'PRODUCT' | 'SERVICE';
  targetId?: string;
  discountAmount: string;
  status: 'RESERVED' | 'COMMITTED' | 'RELEASED';
  committedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  total: string;
  pointsUsedToRedeem: number | null;
  status: string;
  giftCardAmountApplied: number | null;
  giftCardCode: string | null;
  couponDiscountApplied?: number | null;
  couponCode?: string | null;
  rewardDiscountApplied?: number | string | null;
  rewardRedemptions?: OrderRewardRedemption[];
  shippingStatus: string;
  estimatedShippingFee: string;
  actualShippingCost: string | null;
  carrierCode: string | null;
  trackingNumber: string | null;
  labelUrl: string | null;
  user: User;
  items: OrderItem[];
}

export interface OrderStats {
  totalSales: number;
  netSales: number;
  orders: number;
  productsSold: number;
  totalEarnings: number;
  grossSales: number;
  balance: number;
  rewardDiscountTotal?: number;
}
