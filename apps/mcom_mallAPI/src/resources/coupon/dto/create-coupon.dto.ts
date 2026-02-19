import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { CouponSourceType, DiscountType } from '../coupon.enum';

export class CreateCouponDto {
  @ApiProperty({ description: 'Title of the coupon', example: 'Winter Sale 2026' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the coupon' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Unique coupon code', example: 'WINTER26' })
  @IsString()
  code: string;

  @ApiProperty({ 
    description: 'Source of the coupon', 
    enum: CouponSourceType,
    example: CouponSourceType.PLATFORM 
  })
  @IsEnum(CouponSourceType)
  sourceType: CouponSourceType;

  @ApiProperty({ description: 'Discount value (Fixed or Percentage)', example: 10 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ 
    description: 'Type of discount', 
    enum: DiscountType,
    example: DiscountType.FIXED 
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiPropertyOptional({ description: 'Total number of times this coupon can be redeemed (0 = unlimited)', example: 100 })
  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Number of times a single user can redeem this coupon', example: 1 })
  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'Date when the coupon becomes valid', type: Date })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Date when the coupon expires', type: Date })
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Associated Marketing Campaign ID (Required for Platform coupons)', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Associated Business ID (Required for Business coupons)', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @ApiPropertyOptional({ description: 'Business ID for custom branding of a platform coupon', format: 'uuid' })
  @IsString()
  @IsOptional()
  brandingBusinessId?: string;
}
