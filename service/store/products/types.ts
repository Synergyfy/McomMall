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
  options: string[];
}

export interface ProductVariation {
  id: string;
  sku?: string;
  combination: Record<string, string>;
  price: number;
  stock: number;
  available: boolean;
  image?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
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
}

import { Product } from '@/service/listings/types';

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export type { Product };
