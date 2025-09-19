// Promotion History API Types

export interface UserPromotion {
  promotion_id: string;
  promotion_name: string;
  points_balance: number;
  enrollment_date: string; // ISO 8601 date string
}

export interface UserTransaction {
  transaction_id: string;
  type: 'earn' | 'spend';
  points: number;
  description: string;
  timestamp: string; // ISO 8601 date string
}

export interface RedeemedOffer {
  offer_id: string;
  offer_name: string;
  redemption_date: string; // ISO 8601 date string
  points_spent: number;
}

export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
