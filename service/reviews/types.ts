export type Review = {
  id:string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  businessId?: string;
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
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
  businessId: string;
};
