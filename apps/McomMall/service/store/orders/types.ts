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
}
