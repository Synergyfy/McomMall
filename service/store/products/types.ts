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
  }[];
}

export interface ProductVariation {
  id?: string;
  sku?: string;
  combination: Record<string, string>;
  price: number;
  stock: number;
  reservedStock?: number;
  soldCount?: number;
  available: boolean;
  image?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
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
}

export interface CreateProductDto {
  bussinessId: string;
  title: string;
  category: string;
  subCategories?: string[];
  shippingMethod?: 'free' | 'pickup' | 'delivery';
  productType: string;
  price: number;
  description: string;
  sku: string;
  shortDescription?: string;
  imageUrl?: string;
  productUrl?: string;
  fileUrls?: string[];
  downloadLimit?: number;
  downloadExpiry?: number;
  enableStockManagement?: boolean;
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
  sizeGuide?: SizeGuideConfig;
}

import { Product } from '@/service/listings/types';

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export type { Product };
