export interface BundledService {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  images?: string[];
  isActive?: boolean;
  businessId: string;
  pricingModel: 'fixed' | 'perHour' | 'perUnit';
  fixedPrice?: number;
  pricePerHour?: number;
  pricePerUnit?: number;
  unitName?: string;
  enableGuestPricing?: boolean;
  guestPricingModel?: 'perGuest' | 'fixedGroup' | 'baseWithAdditional';
  minGuests?: number;
  maxGuests?: number;
  pricePerGuest?: number;
  fixedGroupPrice?: number;
  basePrice?: number;
  baseGuests?: number;
  additionalGuestPrice?: number;
  isQuoteModel?: boolean;
  bookingFee?: number;
  bundledServices?: { name: string; price?: number }[];
  configurableAddons?: {
    name:string;
    price?: number;
    pricingType: 'oneTime' | 'perGuest' | 'perUnit';
    unitName?: string;
  }[];
}

export interface UpdateServiceDto extends CreateServiceDto {
  id: string;
}

export interface ConfigurableAddon {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  pricingType: 'oneTime' | 'perGuest' | 'perUnit';
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
  pricingModel: 'fixed' | 'perHour' | 'perUnit';
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
