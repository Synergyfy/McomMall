export type Review = {
  id:string;
  rating: number;
  comment: string;
  status?: 'pending' | 'published';
  createdAt: string;
  updatedAt: string;
  businessId?: string;
  productId?: string;
  serviceId?: string;
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
  };
  business?: {
    name: string;
    logo: string;
  };
};

export type PaginatedReviews = {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateReviewPayload = {
  rating: number;
  comment: string;
  businessId?: string;
  productId?: string;
  serviceId?: string;
};
