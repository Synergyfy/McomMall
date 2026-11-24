import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromotionalOfferDto {
  @ApiProperty({ example: 'Designer Leather Handbag' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    enum: ['product', 'service', 'offer'],
    default: 'product',
  })
  @IsOptional()
  @IsIn(['product', 'service', 'offer'])
  offeringType?: 'product' | 'service' | 'offer';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 49.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 39.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ default: 'GBP' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @ApiProperty({
    example: 'https://www.example-advertiser.co.uk/product/123',
    description: 'External advertiser product/service page',
  })
  @IsUrl({ require_tld: false })
  destinationUrl: string;

  @ApiPropertyOptional({
    description: 'Optional pre-built affiliate URL. {clickref} is replaced.',
  })
  @IsOptional()
  @IsString()
  affiliateTrackingUrl?: string;

  @ApiPropertyOptional({ default: 'awin' })
  @IsOptional()
  @IsString()
  affiliateNetwork?: string;

  @ApiPropertyOptional({ description: 'Awin advertiser / merchant ID' })
  @IsOptional()
  @IsString()
  advertiserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advertiserName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advertiserProgramme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awinProductId?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commissionRate?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  businessCommissionRate?: number;

  @ApiPropertyOptional({ enum: ['all', 'selected'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'selected'])
  availability?: 'all' | 'selected';

  @ApiPropertyOptional({ type: [String], description: 'Business IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessIds?: string[];

  @ApiPropertyOptional({
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
  })
  @IsOptional()
  @IsIn(['draft', 'active', 'inactive', 'archived'])
  status?: 'draft' | 'active' | 'inactive' | 'archived';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
