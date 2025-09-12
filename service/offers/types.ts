// Based on the API documentation for the Offer resource

// A placeholder for the Product and Category types.
// In a real application, this might be imported from another module.
export interface Product {
  id: string; // uuid
  name: string;
  // other product fields...
}

export interface Offer {
  id: string; // uuid
  isActive: boolean;
  name: string;
  description?: string;
  points: number;
  beginDate?: string; // ISO
  endDate?: string; // ISO
  rewardCouponType:
    | 'FIXED_CART_DISCOUNT'
    | 'PERCENTAGE_DISCOUNT'
    | 'FREE_PRODUCTS'
    | 'BONUS_POINTS';
  limitUsageToXProducts?: number;
  expireAfterXDays?: number;
  allowFreeShipping?: boolean;
  individualUseOnly?: boolean;
  excludeSaleItems?: boolean;
  limitPerCustomer?: number;
  allowLimitToReset?: boolean;
  includedProducts?: Product[];
  excludedProducts?: Product[];
  created_at: string; // ISO
  updated_at: string; // ISO
}

// Based on the Create Offer DTO
export interface CreateOfferDto {
  name: string;
  description?: string;
  points: number;
  beginDate?: Date;
  endDate?: Date;
  rewardCouponType:
    | 'FIXED_CART_DISCOUNT'
    | 'PERCENTAGE_DISCOUNT'
    | 'FREE_PRODUCTS'
    | 'BONUS_POINTS';
  limitUsageToXProducts?: number;
  expireAfterXDays?: number;
  allowFreeShipping?: boolean;
  individualUseOnly?: boolean;
  excludeSaleItems?: boolean;
  limitPerCustomer?: number;
  allowLimitToReset?: boolean;
  includedProductIds?: string[]; // Array of product UUIDs
  excludedProductIds?: string[]; // Array of product UUIDs
}

export interface UpdateOfferDto extends Partial<CreateOfferDto> {}
