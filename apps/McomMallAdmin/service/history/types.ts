// Promotion History API Types

export interface UserPromotion {
  promotionId: string;
  name: string;
  description: string;
  balance: number;
  status: string;
  endDate: string; // ISO 8601 date string
}

export interface UserTransaction {
  transactionId: string;
  type: 'earn' | 'spend';
  points: number;
  description: string;
  timestamp: string; // ISO 8601 date string
  details?: {
    promotionId?: string;
    promotionName?: string;
  };
}

export interface RedeemedOffer {
  offerId: string;
  offerName: string;
  redemptionDate: string; // ISO 8601 date string
  pointsSpent: number;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: Pagination;
}
