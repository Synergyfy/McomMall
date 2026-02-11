export interface ProductBusiness {
  id: string;
  businessName: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  productType: string;
  price: number;
  sku?: string;
  productStatus: string;
  fileUrls?: string[];
  business?: ProductBusiness;
}

export interface Product extends AdminProduct {
  category: string;
  description: string;
  visibility: string;
  imageUrl?: string;
  shortDescription?: string;
  bussinessId?: string;
  salePrice?: number;
  productUrl?: string;
  downloadLimit?: number;
  downloadExpiry?: number;
  enableStockManagement?: boolean;
  stock?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  purchaseNote?: string;
  enableReviews?: boolean;
  tags?: string[];
  brand?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  price: number;
  stock: number;
}

export interface CreateProductDto {
  bussinessId: string;
  title: string;
  category: string;
  productType: string;
  price: number;
  description: string;
  sku: string;
  shortDescription: string;
  fileUrls: string[];
  productUrl?: string;
  downloadLimit?: number;
  downloadExpiry?: number;
  enableStockManagement: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  productStatus: string;
  visibility: string;
  purchaseNote?: string;
  enableReviews: boolean;
  tags: string[];
  variants: { name: string; options: string[] }[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}