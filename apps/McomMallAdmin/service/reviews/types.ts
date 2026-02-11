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
  business: {
    id: string;
    businessName: string;
    logoUrl: string;
  };
  status?: 'PENDING' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED'; // inferring status types, can be adjusted
  replies?: any[]; // Placeholder for replies if needed
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
  businessId: string;
};
