// Based on the API documentation for the Promotion resource

export interface Promotion {
  id: string; // uuid
  name: string;
  description?: string;
  termsAndConditions?: string;
  isActive: boolean;
  beginDate?: string; // ISO timestamp
  endDate?: string; // ISO timestamp
  promotionType: 'MULTIPLIER' | 'BONUS_POINTS';
  promotionScope:
    | 'ALL_LISTINGS'
    | 'SPECIFIC_LISTINGS'
    | 'ALL_PRODUCTS'
    | 'SPECIFIC_PRODUCTS';
  businessIds?: string[];
  multiplier?: number;
  bonusPoints?: number;
  limitPerCustomer?: number;
  minimumSpend: string; // decimal serialized as string
  includedProducts?: Product[]; // Assuming Product type is defined elsewhere
  excludedProducts?: Product[]; // Assuming Product type is defined elsewhere
  points?: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// Based on the Create Promotion DTO
export interface CreatePromotionDto {
  name: string;
  description?: string;
  termsAndConditions?: string;
  isActive: boolean;
  beginDate?: Date;
  endDate?: Date;
  promotionType: 'MULTIPLIER' | 'BONUS_POINTS';
  promotionScope:
    | 'ALL_LISTINGS'
    | 'SPECIFIC_LISTINGS'
    | 'ALL_PRODUCTS'
    | 'SPECIFIC_PRODUCTS';
  multiplier?: number | null;
  bonusPoints?: number | null;
  limitPerCustomer?: number;
  minimumSpend: number;
  businessIds?: string[];
  includedProductIds?: string[]; // Array of product UUIDs
  excludedProductIds?: string[]; // Array of product UUIDs
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {}

export interface CheckPromotionDto {
  businessId?: string;
  productId?: string;
}

import { User } from '../listings/types';

// A placeholder for the Product type.
// In a real application, this might be imported from another module.
export interface Product {
  id: string; // uuid
  name: string;
  // other product fields...
}

export interface Participant {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  pointsEarned: number;
  user: User;
  promotion: Promotion;
}

export interface UpdatePointsDto {
  amount: number;
}
