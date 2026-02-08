export interface ProductAttribute {
  name: string; // e.g., "Color", "Size"
  options: {
    name: string; // e.g., "Red", "Small"
    priceModifier: number; // Optional +/- to base price
  }[];
}

export interface ProductVariation {
  id?: string;
  // The specific combination of attributes for this variant
  // e.g., { "Color": "Red", "Size": "Small" }
  combination: Record<string, string>;

  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  available: boolean;

  // Metadata
  image?: string; // specific image for this variant
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  warranty?: string;
  notes?: string;
}

export interface Product {
  // ... other standard product fields (title, description)
  title: string;
  description: string;
  basePrice: number;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}
