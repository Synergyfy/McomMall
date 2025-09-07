import { InHouseBusiness, User } from '../listings/types';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'APPROVED';
export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    PAYPAL = 'PAYPAL',
    BANK_TRANSFER = 'BANK_TRANSFER',
    STRIPE = 'STRIPE',
}

export interface ServicePayment {
  id: string;
  user: User;
  booking: Booking;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSlot {
  id: string;
  business: InHouseBusiness;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceModifier {
  id: string;
  business: InHouseBusiness;
  startTime: string;
  endTime: string;
  priceMultiplier: number;
  isAllDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  user: User;
  business: InHouseBusiness;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  payment: ServicePayment | null;
  createdAt: string;
  updatedAt: string;
}
