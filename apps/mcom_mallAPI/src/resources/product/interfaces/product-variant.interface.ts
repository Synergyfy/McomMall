export interface ProductVariantOption {
  name: string; // e.g., "Red", "XL"
  priceModifier: number; // e.g., 3.00, 5.00
}

export interface ProductVariantConfig {
  name: string; // e.g., "Color", "Size"
  type: string; // e.g., "select", "radio"
  options: ProductVariantOption[];
}

export interface ProductAttribute {
  name: string;
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
  salePrice?: number;
  stock: number;
  available: boolean;
  image?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  warranty?: string;
  notes?: string;
}
