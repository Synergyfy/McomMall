import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { CouponSourceType, DiscountType } from '../coupon.enum';

export class CreateCouponDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  code: string;

  @IsEnum(CouponSourceType)
  sourceType: CouponSourceType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  expiresAt?: Date;

  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsUUID()
  @IsOptional()
  businessId?: string;

  @IsString()
  @IsOptional()
  brandingBusinessId?: string;
}
