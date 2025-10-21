import { PricingModel } from "./enums";

// The base properties for most entities
interface AbstractBaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
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
  listingType: ('product_seller' | 'service_provider')[];
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
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
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
interface BundledService extends AbstractBaseEntity {
  serviceId: string;
  name: string;
  price: number;
  deletedAt?: Date | null;
}

// Interface for a Configurable Addon (part of a Service)
interface ConfigurableAddon extends AbstractBaseEntity {
  serviceId: string;
  name: string;
  price: number;
  pricingType: 'ONE_OFF' | 'PER_UNIT';
  unitName?: string | null;
  deletedAt?: Date | null;
}

// Interface for a Service
export interface Service extends AbstractBaseEntity {
  business?: Business;
  businessId: string;
  name: string;
  description?: string | null;
  media?: string[] | null;
  isActive: boolean;
  pricingModel: PricingModel;
  fixedPrice?: string | null;
  pricePerHour?: string | null;
  pricePerUnit?: string | null;
  unitName?: string | null;
  enableGuestPricing: boolean;
  guestPricingModel?: 'FIXED' | 'PER_PERSON' | 'FIXED_GROUP' | 'BASE_PLUS_PER_GUEST' | null;
  minGuests?: number | null;
  maxGuests?: number | null;
  pricePerGuest?: number | null;
  fixedGroupPrice?: number | null;
  basePrice?: number | null;
  baseGuests?: number | null;
  additionalGuestPrice?: number | null;
  isQuoteModel: boolean;
  bookingFee?: number | null;
  bundledServices: BundledService[];
  configurableAddons: ConfigurableAddon[];
  deletedAt?: Date | null;
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
