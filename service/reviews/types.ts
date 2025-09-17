export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  businessId?: string; // Optional because it's not in the business review response
  author?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

export type CreateReviewPayload = {
  rating: number;
  comment: string;
  businessId: string;
};
