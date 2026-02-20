import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  IsArray,
  IsInt,
  Min,
  IsBoolean,
  IsIn,
  IsUUID,
} from 'class-validator';

import { ProductVariantConfig, ProductAttribute, ProductVariation } from '../interfaces/product-variant.interface';

export class CreateProductDto {
  @ApiProperty({
    description: 'The attributes for product variants (e.g., Color: [Red, Blue]).',
    required: false,
    example: [
      {
        name: 'Color',
        options: [
          { name: 'Red', priceModifier: 0 },
          { name: 'Blue', priceModifier: 0 }
        ]
      },
      {
        name: 'Size',
        options: [
          { name: 'S', priceModifier: 0 },
          { name: 'M', priceModifier: 0 }
        ]
      }
    ]
  })
  @IsOptional()
  @IsArray()
  attributes?: ProductAttribute[];

  @ApiPropertyOptional({
    description: 'The specific variations generated from attributes.',
    required: false,
    example: [
      {
        combination: { Color: 'Red', Size: 'S' },
        sku: 'SHIRT-RED-S',
        price: 25.0,
        salePrice: 20.0,
        stock: 50,
        available: true,
        image: 'https://example.com/red-s.jpg',
        warranty: '1 Year',
        notes: 'limited edition'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  variations?: ProductVariation[];

  @ApiPropertyOptional({
    description: 'Whether to use specific pricing and inventory per variant.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  useVariantPricing?: boolean;

  @ApiProperty({
    description: 'The configuration for product variants (e.g., color, size).',
    example: [
      {
        name: 'Color',
        type: 'select',
        options: [
          { name: 'Red', priceModifier: 0 },
          { name: 'Blue', priceModifier: 3 }
        ]
      }
    ],
    required: false
  })
  @IsOptional()
  @IsArray()
  variantConfig?: ProductVariantConfig[];

  @ApiPropertyOptional({
    description: 'The ID of the service provider to associate with this product.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID()
  serviceProviderId?: string;

  @ApiProperty({
    description: 'The ID of the business.',
    example: '12323-`asdasd-asdasd-123123',
  })
  @IsString()
  @IsNotEmpty()
  bussinessId: string;

  @ApiPropertyOptional({
    description: 'The title of the product (frontend style).',
    example: 'Premium Arabica Coffee Beans',
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({
    description: 'The title of the product.',
    example: 'Premium Arabica Coffee Beans',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "The product's main category.",
    example: 'Groceries',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: "The product's sub-category.",
    example: 'Organic',
  })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({
    description: 'The brand of the product.',
    example: 'Nestle',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'The intended gender for the product.',
    example: 'unisex',
  })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'unisex', 'none'])
  gender?: string;

  @ApiPropertyOptional({
    description: 'The shipping method for the product.',
    example: 'delivery',
  })
  @IsOptional()
  @IsString()
  @IsIn(['free', 'pickup', 'delivery'])
  shippingMethod?: string;

  @ApiPropertyOptional({
    description: 'The fulfillment types for the product.',
    type: [String],
    example: ['pickup', 'shipping'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fulfillmentType?: string[];

  @ApiPropertyOptional({
    description: 'Whether free delivery is offered.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFreeDelivery?: boolean;

  @ApiPropertyOptional({
    description: 'Whether paid delivery is offered.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPaidDelivery?: boolean;

  @ApiPropertyOptional({
    description: 'The radius for free delivery in miles.',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryRadius?: number;

  @ApiPropertyOptional({
    description: 'Instructions for pickup.',
    example: 'Park in the yellow zone.',
  })
  @IsOptional()
  @IsString()
  pickupInstructions?: string;

  @ApiProperty({
    description:
      'The type of the product. Can be physical, virtual, or downloadable.',
    example: 'physical',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['physical', 'virtual', 'downloadable'])
  productType: string;

  @ApiPropertyOptional({ description: 'The price of the product (frontend style).', example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  regular_price?: number;

  @ApiPropertyOptional({ description: 'The sale price of the product (frontend style).', example: 35.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sale_price?: number;

  @ApiPropertyOptional({ description: 'The price of the product.', example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'The sale price of the product.', example: 35.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({
    description: 'The short description (frontend style).',
    example: 'Roasted to perfection.',
  })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @ApiPropertyOptional({
    description: 'The full description (frontend style).',
    example: 'A full-bodied blend...',
  })
  @IsOptional()
  @IsString()
  fullDesc?: string;

  @ApiProperty({
    description:
      'The full description of the product, supporting rich text or markdown.',
    example:
      'A full-bodied blend of the finest arabica beans from South America...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'The unique Stock Keeping Unit (SKU). Required for physical products.',
    example: 'COFFEE-BEANS-001',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({
    description: 'A short, catchy summary of the product.',
    example: 'Roasted to perfection for a smooth, rich flavor.',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'An array of URLs for product media (frontend style).',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'An array of URLs for product videos (frontend style).',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videos?: string[];

  @ApiPropertyOptional({
    description: 'An array of URLs for product media (images or videos).',
    type: [String],
    example: [
      'https://example.com/images/coffee.jpg',
      'https://example.com/videos/coffee.mp4',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  media?: string[];

  @ApiPropertyOptional({
    description:
      'The URL for accessing a virtual product (e.g., a webinar link).',
    example: 'https://zoom.us/j/1234567890',
  })
  @IsOptional()
  @IsUrl()
  productUrl?: string;

  @ApiPropertyOptional({
    description: 'An array of URLs for downloadable files.',
    type: [String],
    example: ['https://example.com/files/ebook.pdf'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fileUrls?: string[];

  @ApiPropertyOptional({
    description:
      'Number of times a file can be downloaded. Use -1 for unlimited.',
    default: -1,
  })
  @IsOptional()
  @IsInt()
  downloadLimit?: number;

  @ApiPropertyOptional({
    description:
      'Days after purchase the download link is valid. Use -1 for no expiry.',
    default: -1,
  })
  @IsOptional()
  @IsInt()
  downloadExpiry?: number;

  @ApiPropertyOptional({
    description: 'Whether to manage stock levels for this product.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enableStockManagement?: boolean;

  @ApiPropertyOptional({
    description: 'The current stock level (frontend style).',
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'The current stock level.',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'The low stock threshold for notifications.',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'The weight of the product in kilograms.',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'The length of the package in centimeters.',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({
    description: 'The width of the package in centimeters.',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({
    description: 'The height of the package in centimeters.',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({
    description: 'Configuration for size guide.',
  })
  @IsOptional()
  sizeGuide?: any;

  @ApiPropertyOptional({
    description: 'The current status of the product.',
    default: 'draft',
    enum: ['draft', 'published', 'archived', 'publish'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived', 'publish'])
  productStatus?: string;

  @ApiPropertyOptional({
    description: 'The visibility of the product in the store.',
    default: 'public',
    enum: ['public', 'private', 'password-protected'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'private', 'password-protected'])
  visibility?: string;

  @ApiPropertyOptional({
    description:
      'A note to send to the customer after they complete their purchase.',
    example:
      'Thank you for your order! Your product is being prepared for shipment.',
  })
  @IsOptional()
  @IsString()
  purchaseNote?: string;

  @ApiPropertyOptional({
    description: 'Whether to allow customer reviews for this product.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enableReviews?: boolean;

  @ApiPropertyOptional({
    description:
      'An array of tags for organizing and searching for the product.',
    type: [String],
    example: ['coffee', 'beverage', 'arabica'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
