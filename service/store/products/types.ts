export interface ProductVariant {
  name: string;
  options: string[];
}

export interface CreateProductDto {
  bussinessId: string;
  title: string;
  category: string;
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
}

import { Product } from '@/service/listings/types';

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export type { Product };
