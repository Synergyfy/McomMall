// --- Google Place Types ---

export interface Photo {
  photo_reference: string;
  height: number;
  width: number;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
      // ... other fields if needed
    };
  };
  photos?: Photo[];
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

export interface InHouseBusiness {
  id: string;
  name: string;
  title?: string;
  description?: string;
  categories?: { name: string }[];
  logoUrl?: string; // Also adding logoUrl as it was used in ListingDetails
  businessName?: string;
  location?: {
    addressLine1: string;
    city: string;
  };
  businessPhone?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  isGoogleVerified?: boolean;
  listingType?: ListingType[];
  isClaimed?: boolean;
  [key: string]: unknown;
}

export interface InHouseBusinessResults {
  data: InHouseBusiness[];
}

// --- Listing Types ---

export interface RecentListings {
  data: Array<{
    id: string;
    title: string;
    [key: string]: unknown;
  }>;
}

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
