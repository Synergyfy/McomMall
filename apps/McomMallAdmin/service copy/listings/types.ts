// --- Google Place Types ---

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
  };
  business_status?: string;
}

export type GooglePlaceResults = GooglePlaceResult[];

// --- In-House Business Types ---

export interface InHouseBusinessResults {
  data: Array<{
    id: string;
    name: string;
    [key: string]: unknown;
  }>;
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
