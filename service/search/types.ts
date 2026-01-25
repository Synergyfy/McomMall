import { PricingModel } from "./enums";

// The base properties for most entities
interface AbstractBaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface for a User
interface User extends AbstractBaseEntity {
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: 'consumer' | 'business' | 'admin';
  profilePictureUrl?: string | null;
  points: number;
  giftCard: boolean;
  voucher: boolean;
  promotion: boolean;
}

// Interface for a Business
interface Business extends AbstractBaseEntity {
  user: User;
  userId: string;
  createdAt: string;
  updatedAt: string;
  listingType: string[]; // Changed to string[] to match IBusiness
  businessName: string;
  legalName?: string | null;
  companyRegistrationNumber?: string | null;
  vatNumber?: string | null;
  shortDescription: string;
  about?: string | null;
  website?: string | null;
  businessPhone: string;
  businessEmail?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  logoAltText?: string | null;
  bannerAltText?: string | null;
  media?: string[] | null;
  status: string; // Changed to string to match IBusiness
  googlePlaceId?: string | null;
  isGoogleVerified: boolean;
  isClaimed: boolean;
}

// Interface for a Product
export interface Product extends AbstractBaseEntity {
  serviceProvider?: User;
  business?: Business;
  title: string;
  productType: string;
  price: number;
  shortDescription: string | null;
  description: string;
  media: string[] | null;
  productUrl?: string | null;
  fileUrls?: string[] | null;
  downloadLimit: number;
  downloadExpiry: number;
  sku?: string;
  enableStockManagement: boolean;
  weight: number;
  length: number;
  width: number;
  height: number;
  productStatus: string;
  visibility: string;
  purchaseNote?: string | null;
  enableReviews: boolean;
  tags?: string[] | null;
  category: string;
}

// Interface for a Bundled Service (part of a Service)
export interface BundledService {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}

// Interface for a Configurable Addon (part of a Service)
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

// Interface for a Service
export interface Service extends AbstractBaseEntity {
  business?: Business;
  businessId: string;
  name: string;
  description?: string;
  media: string[] | null;
  isActive: boolean;
  pricingModel: PricingModel;
  fixedPrice: string | null;
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
  bookingFee: string | null;
  bundledServices: BundledService[];
  configurableAddons: ConfigurableAddon[];
  deletedAt: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
