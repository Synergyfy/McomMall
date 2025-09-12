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
  multiplier?: number;
  bonusPoints?: number;
  limitPerCustomer?: number;
  minimumSpend: string; // decimal serialized as string
  includedProducts?: Product[]; // Assuming Product type is defined elsewhere
  excludedProducts?: Product[]; // Assuming Product type is defined elsewhere
  created_at: string; // ISO
  updated_at: string; // ISO
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
  minimumSpend: string;
  businessIds?: string[];
  includedProductIds?: string[]; // Array of product UUIDs
  excludedProductIds?: string[]; // Array of product UUIDs
}

// A placeholder for the Product type.
// In a real application, this might be imported from another module.
export interface Product {
  id: string; // uuid
  name:string;
  // other product fields...
}
