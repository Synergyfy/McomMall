import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FlashSaleStatus } from '../flash-sale.enum';

export class CreateFlashSaleItemDto {
  @ApiProperty({
    description: 'Title of the flash sale item',
    example: 'Do Pass Yourself',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Short description of the deal',
    example: 'Massive flash sale on all gourmet burgers',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category of the item',
    example: 'Appliances',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: 'Image URL of the item',
    example: 'https://placehold.co/200x200/png',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Original price of the item',
    example: 120.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Discounted price during the flash sale',
    example: 99.99,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountedPrice?: number;

  @ApiPropertyOptional({
    description: 'Remaining stock available for the sale',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  itemsLeft?: number;

  @ApiProperty({
    description: 'When the flash sale ends (ISO date)',
    example: '2026-09-30T23:59:59.000Z',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'When the flash sale starts (ISO date)',
    example: '2026-09-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Status of the flash sale item',
    enum: FlashSaleStatus,
    example: FlashSaleStatus.ACTIVE,
  })
  @IsEnum(FlashSaleStatus)
  @IsOptional()
  status?: FlashSaleStatus;

  @ApiPropertyOptional({
    description: 'Business ID that owns this flash sale',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiPropertyOptional({
    description: 'Related product ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsOptional()
  productId?: string;
}
