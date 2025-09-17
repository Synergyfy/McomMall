export type Review = {
  id: string;
  rating: number;
  comment: string;
  businessId: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  date: string;
};

export type CreateReviewPayload = {
  rating: number;
  comment: string;
  businessId: string;
};
