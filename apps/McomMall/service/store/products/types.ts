export interface ProductVariant {
  name: string;
  type: string;
  options: {
    name: string;
    quantity: number;
    priceModifier: number;
  }[];
}

export interface ProductAttribute {
  name: string;
  type?: string;
  options: {
    name: string;
    priceModifier: number;
    price?: number; // Override price for all variations under this option (if it's a parent)
  }[];
}

export interface ProductVariation {
  id?: string;
  sku?: string;
  combination: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  reservedStock?: number;
  soldCount?: number;
  lowStockThreshold?: number;
  available: boolean;
  image?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  warranty?: string;
  notes?: string;
}

export interface SizeGuideMeasurement {
  size: string; // e.g., "S", "M", "L", "40", "42"
  bust?: string;
  waist?: string;
  hip?: string;
  length?: string;
  height?: string;
  width?: string; // For shoes
  footLength?: string; // For shoes
  [key: string]: string | undefined; // Allow custom measurements
}

export interface SizeGuideConfig {
  enabled: boolean;
  system: 'international' | 'us' | 'uk' | 'eu' | 'asian' | 'custom';
  measurements: SizeGuideMeasurement[];
  conversionMap?: Record<string, string>; // e.g., { "S": "US 4", "M": "US 6" }
  imageUrl?: string; // For Body Diagram
  diagrams?: {
    male?: string;
    female?: string;
    unisex?: string;
  };
}

export interface CreateProductDto {
  serviceProviderId?: string;
  bussinessId: string;
  productName?: string;
  title: string;
  category: string;
  subCategory?: string;
  subCategories?: string[];
  brand?: string;
  gender?: 'male' | 'female' | 'unisex' | 'none' | string;
  shippingMethod?: 'free' | 'pickup' | 'delivery' | string;
  fulfillmentType?: string[];
  isFreeDelivery?: boolean;
  isPaidDelivery?: boolean;
  freeDeliveryRadius?: number;
  pickupInstructions?: string;
  productType: string;
  regular_price?: number;
  sale_price?: number;
  price: number;
  salePrice?: number;
  shortDesc?: string;
  fullDesc?: string;
  description: string;
  sku: string;
  shortDescription?: string;
  images?: string[];
  videos?: string[];
  media?: string[];
  imageUrl?: string;
  productUrl?: string;
  fileUrls?: string[];
  downloadLimit?: number;
  downloadExpiry?: number;
  enableStockManagement?: boolean;
  quantity?: number;
  stock?: number;
  lowStockThreshold?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  productStatus?: string;
  visibility?: string;
  purchaseNote?: string;
  enableReviews?: boolean;
  tags?: string[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  variantConfig?: any[];
  useVariantPricing?: boolean;
  sizeGuide?: SizeGuideConfig;
  isFeatured?: boolean;
  isRotatorEligible?: boolean;
  isPromotionEligible?: boolean;
}

import { Product } from '@/service/listings/types';

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export type { Product };
