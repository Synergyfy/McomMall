export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'approved';

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  CASH = 'CASH',
  WALLET = 'WALLET',
}

// Represents the structure of the nested User object
export interface BookingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

// Represents the structure of the nested Business object
export interface BookingBusiness {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
}

// Represents the structure of the nested Service object
export interface BookingService {
  id: string;
  name: string;
  description: string;
  pricingModel: string;
  fixedPrice: string | null;
  business: BookingBusiness; // Nested business
}

// Represents the main Booking object
export interface Booking {
  id: string;
  createdAt: string;
  updatedAt: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  user: BookingUser; // Nested user
  service: BookingService; // Nested service
  payment?: any; // Payment is not in the provided response, marked as optional
}

// Payload for creating a new booking
export interface CreateBookingPayload {
  serviceId?: string;
  businessId?: string;
  startTime: string;
  endTime: string;
  addonIds?: string[];
}