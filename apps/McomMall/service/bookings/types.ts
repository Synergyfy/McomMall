import { InHouseBusiness, User } from '../listings/types';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'approved'
  | 'completed'
  | 'refunded';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  STRIPE = 'stripe',
}

export interface Service {
  id: string;
  createdAt: string;
  updatedAt: string;
  businessId: string;
  name: string;
  description: string;
  images: string[];
  isActive: boolean;
  pricingModel: string;
  fixedPrice: string;
  pricePerHour: string | null;
  pricePerUnit: string | null;
  unitName: string | null;
  enableGuestPricing: boolean;
  guestPricingModel: string;
  minGuests: number;
  maxGuests: number;
  pricePerGuest: string;
  fixedGroupPrice: string | null;
  basePrice: string | null;
  baseGuests: number | null;
  additionalGuestPrice: string | null;
  isQuoteModel: boolean;
  bookingFee: string | null;
  deletedAt: string | null;
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
  status: BookingStatus;
  user: User;
  service: Service;
  payment: Payment;
  businessOwnerCompleted: boolean;
  customerCompleted: boolean;
  totalAmount?: number;
  commissionAmount?: number;
  providerAmount?: number;
  paymentIntentId?: string;
  transferId?: string;
  refundId?: string;
  payoutProcessed?: boolean;
  refundProcessed?: boolean;
}

export interface CreateBookingPayload {
  serviceId?: string;
  businessId?: string;
  startTime: string;
  endTime: string;
  addonIds?: string[];
}
