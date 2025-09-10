import { User } from '@/service/listings/types';
import { Payment } from '@/service/bookings/types';

export interface Order {
  id: string;
  user: User;
  quantity: number;
  payment: Payment;
  created_at: string;
}
