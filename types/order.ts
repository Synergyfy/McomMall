export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export interface OrderPaymentDto {
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId: string;
}

import { Product } from '@/service/listings/types';
import { User } from '@/service/listings/types';

export interface CreateOrderDto {
  productId: string;
  quantity: number;
  payment: OrderPaymentDto;
}

export interface OrderPayment {
  id: string;
  user: User;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  transactionId: string;
}

export interface Order {
  id: string;
  user: User;
  product: Product;
  quantity: number;
  payment: OrderPayment;
  created_at: string;
}
