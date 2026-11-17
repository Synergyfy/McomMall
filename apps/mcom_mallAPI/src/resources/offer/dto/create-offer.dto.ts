import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { RewardCouponType } from '../offer.enum';

export class CreateOfferDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTimeBonus?: boolean;

  @IsInt()
  points: number;

  @IsOptional()
  @IsDateString()
  beginDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsEnum(RewardCouponType)
  rewardCouponType: RewardCouponType;

  @ValidateIf(
    (o) => o.rewardCouponType === RewardCouponType.FIXED_CART_DISCOUNT,
  )
  @IsNumber()
  discountAmount?: number;

  @ValidateIf(
    (o) => o.rewardCouponType === RewardCouponType.PERCENTAGE_DISCOUNT,
  )
  @IsNumber()
  discountPercentage?: number;

  @ValidateIf((o) => o.rewardCouponType === RewardCouponType.FREE_PRODUCTS)
  @IsUUID()
  freeProductId?: string;

  @ValidateIf((o) => o.rewardCouponType === RewardCouponType.BONUS_POINTS)
  @IsInt()
  bonusPoints?: number;

  @IsOptional()
  @IsInt()
  limitUsageToXProducts?: number;

  @IsOptional()
  @IsInt()
  expireAfterXDays?: number;

  @IsOptional()
  @IsBoolean()
  allowFreeShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  individualUseOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  excludeSaleItems?: boolean;

  @IsOptional()
  @IsInt()
  limitPerCustomer?: number;

  @IsOptional()
  @IsBoolean()
  allowLimitToReset?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  includedProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  excludedProductIds?: string[];
}
