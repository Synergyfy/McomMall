import { User } from '@/service/listings/types';
import { Payment } from '@/service/bookings/types';

export interface Order {
  id: string;
  user: User;
  quantity: number;
  payment: Payment;
  created_at: string;
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
