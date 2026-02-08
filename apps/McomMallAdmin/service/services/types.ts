export interface Service {
  id: string;
  name: string;
  description: string;
  businessId: string;
  businessName: string;
  category: string;
  pricingModel: 'fixed' | 'perHour' | 'perUnit';
  fixedPrice: string | null;
  pricePerHour: string | null;
  pricePerUnit: string | null;
  unitName: string;
  enableGuestPricing: boolean;
  guestPricingModel: 'perGuest' | 'fixedGroup' | 'baseAndAdditional';
  minGuests: number;
  maxGuests: number;
  pricePerGuest: string | null;
  fixedGroupPrice: string | null;
  basePrice: string | null;
  baseGuests: number | null;
  additionalGuestPrice: string | null;
  isQuoteModel: boolean;
  bookingFee: string | null;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bundledServices: any[];
  configurableAddons: any[];
  business: {
    id: string;
    businessName: string;
    logoUrl: string | null;
    bannerUrl: string | null;
  };
}

export interface AdminService {
  id: string;
  name: string;
  businessName: string;
  businessId: string;
  category: string;
  price: number;
  duration: number;
  status: 'active' | 'inactive';
  description: string;
  images: string[];
  createdAt: string;
}

export interface AdminServiceStats {
  total: number;
  active: number;
  avgDuration: number;
}

export interface AdminServiceResponse {
  data: AdminService[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminServiceFilters {
  search?: string;
  status?: string | 'active';
  category?: string;
  page?: number;
  limit?: number;
}
