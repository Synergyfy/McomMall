export interface BundledService {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfigurableAddon {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  pricingType: 'FIXED' | 'PER_UNIT';
  unitName: string;
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  images: string[];
  isActive: boolean;
  pricingModel: 'FIXED' | 'HOURLY' | 'PER_UNIT';
  fixedPrice: string;
  pricePerHour: string | null;
  pricePerUnit: string | null;
  unitName: string | null;
  enableGuestPricing: boolean;
  guestPricingModel: string | null;
  minGuests: number;
  maxGuests: number;
  pricePerGuest: string | null;
  fixedGroupPrice: string | null;
  basePrice: string | null;
  baseGuests: string | null;
  additionalGuestPrice: string | null;
  isQuoteModel: boolean;
  bookingFee: string;
  bundledServices: BundledService[];
  configurableAddons: ConfigurableAddon[];
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}
