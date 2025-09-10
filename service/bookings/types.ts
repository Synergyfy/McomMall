import { InHouseBusiness, User } from '../listings/types';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'approved';
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STRIPE = 'STRIPE',
}

export interface Service {
  id: string;
  createdAt: string;
  updatedAt: string;
  businessId: string;
  name: string;
  description: string;
  images: any[];
  isActive: boolean;
  pricingModel: string;
  fixedPrice: string;
  pricePerHour: null;
  pricePerUnit: null;
  unitName: null;
  enableGuestPricing: boolean;
  guestPricingModel: string;
  minGuests: number;
  maxGuests: number;
  pricePerGuest: string;
  fixedGroupPrice: null;
  basePrice: null;
  baseGuests: null;
  additionalGuestPrice: null;
  isQuoteModel: boolean;
  bookingFee: null;
  deletedAt: null;
}

export interface Payment {
  id: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  transactionId: string;
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
  createdAt: string;
  updatedAt: string;
  startTime: string;
  endTime: string;
  status: string;
  user: User;
  service: Service;
  payment: Payment;
}

export interface CreateBookingPayload {
  serviceId: string;
  startTime: string;
  endTime: string;
}
