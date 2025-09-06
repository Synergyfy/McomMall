import { User } from '@/service/listings/types';
import { ServicePayment } from '@/service/bookings/types';

export interface Order {
  id: string;
  user: User;
  quantity: number;
  payment: ServicePayment;
  created_at: string;
}
