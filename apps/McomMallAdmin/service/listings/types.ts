// --- Google Place Types ---

export interface Photo {
  photo_reference: string;
  height: number;
  width: number;
}

export interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
}

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time?: number;
}

import { Review as ApiReview } from '../reviews/types';
import { Product } from '../store/products/types';

export type { ApiReview, Product };

export type Review = GoogleReview | ApiReview;

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: Geometry;
  photos?: Photo[];
  reviews?: Review[];
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
  };
  business_status?: string;
  priceLevel?: string;
  vicinity?: string;
  formatted_phone_number?: string;
  // ... other fields
}

export type GooglePlaceResults = GooglePlaceResult[];

// --- In-House Business Types ---

export type ListingType = 'product' | 'service';

export interface Location {
  id: string;
  addressLine1: string;
  city: string;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface InHouseBusiness {
  id: string;
  name: string;
  title?: string;
  description?: string;
  categories?: { name: string }[];
  logoUrl?: string; // Also adding logoUrl as it was used in ListingDetails
  businessName?: string;
  location?: Location;
  businessPhone?: string;
  user?: User;
  isGoogleVerified?: boolean;
  listingType?: ListingType[];
  isClaimed?: boolean;
  products?: Product[];
  about?: string;
  shortDescription?: string;
  website?: string;
  businessEmail?: string;
  businessHours?: any[];
  productSellerProfile?: any;
  serviceProviderProfile?: any;
  [key: string]: unknown;
}

export interface InHouseBusinessResults {
  data: InHouseBusiness[];
}

export type UserListing = InHouseBusiness;

// --- Listing Types ---

export interface RecentListing {
  id: string;
  businessName: string;
  location: {
    addressLine1: string;
    city: string;
  };
  createdAt: string;
  categories: { name: string }[];
  [key: string]: unknown;
}

export type RecentListings = RecentListing[];

export interface CreateBusinessPayload {
  title: string;
  description: string;
  price: number;
  categoryIds: string[];
  sectorId?: string;
  location?: string;
  images?: string[];
  [key: string]: unknown;
}

// --- Admin Listing Types ---

export interface AdminListing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'approved' | 'pending' | 'rejected' | 'draft';
  featured: boolean;
  rating: number;
  reviewCount: number;
  businessName: string;
  category: string;
  sector: string;
  location: string;
  images: string[];
  createdAt?: string;
}

export interface AdminListingStats {
  total: number;
  pending: number;
  approved: number;
  featured: number;
}

export interface AdminListingsResponse {
  data: AdminListing[];
  total?: number;
  page?: number;
  limit?: number;
}
