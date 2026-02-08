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
  IsNotEmpty,
} from 'class-validator';
import { RewardCouponType, OfferScope } from '../offer.enum';

export class CreateOfferDto {
  @IsEnum(OfferScope)
  offerScope: OfferScope;

  @ValidateIf((o) => o.offerScope === OfferScope.SPECIFIC_LISTINGS)
  @IsArray()
  @IsUUID('all', { each: true })
  businessIds: string[];

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

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

  @ValidateIf(
    (o) =>
      o.offerScope === OfferScope.SPECIFIC_PRODUCTS ||
      o.includedProductIds !== undefined,
  )
  @IsArray()
  @IsUUID('all', { each: true })
  @ValidateIf((o) => o.offerScope === OfferScope.SPECIFIC_PRODUCTS)
  @IsNotEmpty()
  includedProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  excludedProductIds?: string[];
}
