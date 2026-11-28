import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TAKEADS_CURRENCIES,
  TAKEADS_OFFER_TYPES,
  TAKEADS_SOURCE_TYPES,
  TAKEADS_VISIBILITIES,
} from '../takeads.constants';

export class CreateTakeadsOfferDto {
  @IsIn(TAKEADS_SOURCE_TYPES)
  sourceType: (typeof TAKEADS_SOURCE_TYPES)[number];

  @IsOptional()
  @IsString()
  externalCouponId?: string;

  @IsOptional()
  @IsString()
  externalMerchantId?: string;

  @IsOptional()
  @IsString()
  externalProgramId?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  destinationUrl?: string;

  /** Set by the explicit resolve step; never trusted without safe-URL checks. */
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  resolvedTrackingUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{1,30}$/)
  subId?: string;

  /** Admin-entered GBP pounds; converted to integer pence before storage. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number | null;

  @IsOptional()
  @IsIn(TAKEADS_VISIBILITIES)
  visibility?: (typeof TAKEADS_VISIBILITIES)[number];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allowedPlanVariantIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  imageSource?: string;

  @IsOptional()
  @IsString()
  mcomSectorId?: string;

  @IsOptional()
  @IsString()
  mcomCategoryId?: string;

  @IsOptional()
  @IsString()
  mcomSubCategoryId?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  /** MCOM currently publishes TakeAds prices in GBP only. */
  @IsOptional()
  @IsIn(TAKEADS_CURRENCIES)
  currency?: (typeof TAKEADS_CURRENCIES)[number];

  @IsOptional()
  @IsIn(TAKEADS_OFFER_TYPES)
  offerType?: (typeof TAKEADS_OFFER_TYPES)[number];

  @IsOptional()
  @IsString()
  campaignLabel?: string;

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateTakeadsOfferDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  imageSource?: string;

  @IsOptional()
  @IsString()
  mcomSectorId?: string;

  @IsOptional()
  @IsString()
  mcomCategoryId?: string;

  @IsOptional()
  @IsString()
  mcomSubCategoryId?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  /** MCOM currently publishes TakeAds prices in GBP only. */
  @IsOptional()
  @IsIn(TAKEADS_CURRENCIES)
  currency?: (typeof TAKEADS_CURRENCIES)[number];

  /** Admin-entered GBP pounds; converted to integer pence before storage. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number | null;

  @IsOptional()
  @IsIn(TAKEADS_VISIBILITIES)
  visibility?: (typeof TAKEADS_VISIBILITIES)[number];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allowedPlanVariantIds?: string[];

  @IsOptional()
  @IsIn(TAKEADS_OFFER_TYPES)
  offerType?: (typeof TAKEADS_OFFER_TYPES)[number];

  @IsOptional()
  @IsString()
  campaignLabel?: string;

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  adminDisabled?: boolean;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class ReviewTakeadsMerchantDto {
  @IsIn(['accepted', 'rejected', 'inactive', 'not_reviewed'])
  status: 'accepted' | 'rejected' | 'inactive' | 'not_reviewed';

  @IsOptional()
  @IsString()
  mcomSectorId?: string;

  @IsOptional()
  @IsString()
  mcomCategoryId?: string;

  @IsOptional()
  @IsString()
  mcomSubCategoryId?: string;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class ReviewTakeadsCouponDto {
  @IsOptional()
  @IsIn(['approved', 'rejected', 'pending'])
  approvalStatus?: 'approved' | 'rejected' | 'pending';

  @IsOptional()
  @IsIn(['published', 'unpublished', 'paused', 'withdrawn', 'expired'])
  publicationStatus?:
    | 'published'
    | 'unpublished'
    | 'paused'
    | 'withdrawn'
    | 'expired';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  adminDisabled?: boolean;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class RejectTakeadsOfferDto {
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class SyncTakeadsDto {
  @IsIn(['merchants', 'coupons', 'reports', 'all'])
  type: 'merchants' | 'coupons' | 'reports' | 'all';
}

/**
 * Step 2 of the product journey: resolve a destination URL before an MCOM
 * offer record is saved, so an ineligible URL never leaves a publishable
 * draft behind.
 */
export class ResolveTakeadsLinkDto {
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  destinationUrl: string;

  @IsString()
  @MaxLength(160)
  externalMerchantId: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  placement?: string;

  @IsOptional()
  @IsString()
  externalProgramId?: string;
}

/**
 * Authenticated business click-through. The server resolves the user's plan
 * variant and returns the tracked destination; the browser opens it after the
 * API call succeeds.
 */
export class RecordTakeadsBusinessClickDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  placement?: string;
}
