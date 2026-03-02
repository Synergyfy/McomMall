export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  businessId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    profilePictureUrl: string | null;
  };
  business?: {
    id: string;
    businessName: string;
    logoUrl: string;
  };
  product?: {
    id: string;
    title: string;
  };
  service?: {
    id: string;
    name: string;
  };
  status?: 'pending' | 'published' | 'PENDING' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED'; // standardizing based on backend enum but keeping case flexibility
  replies?: any[]; 
};

export type PaginatedReviews = {
  data: Review[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type CreateReviewPayload = {
  rating: number;
  comment: string;
  businessId?: string;
  productId?: string;
  serviceId?: string;
};
