import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  TAKEADS_APPROVAL_STATUSES,
  TAKEADS_MERCHANT_STATUSES,
  TAKEADS_OFFER_TYPES,
  TAKEADS_PUBLICATION_STATUSES,
  TAKEADS_SOURCE_TYPES,
  TAKEADS_VISIBILITIES,
} from '../takeads.constants';

export class TakeadsPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}

export class TakeadsMerchantQueryDto extends TakeadsPaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(TAKEADS_MERCHANT_STATUSES)
  status?: (typeof TAKEADS_MERCHANT_STATUSES)[number];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}

export class TakeadsCouponQueryDto extends TakeadsPaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(TAKEADS_APPROVAL_STATUSES)
  approvalStatus?: (typeof TAKEADS_APPROVAL_STATUSES)[number];

  @IsOptional()
  @IsIn(TAKEADS_PUBLICATION_STATUSES)
  publicationStatus?: (typeof TAKEADS_PUBLICATION_STATUSES)[number];

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}

export class TakeadsOfferQueryDto extends TakeadsPaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(TAKEADS_APPROVAL_STATUSES)
  approvalStatus?: (typeof TAKEADS_APPROVAL_STATUSES)[number];

  @IsOptional()
  @IsIn(TAKEADS_PUBLICATION_STATUSES)
  publicationStatus?: (typeof TAKEADS_PUBLICATION_STATUSES)[number];

  @IsOptional()
  @IsIn(TAKEADS_SOURCE_TYPES)
  sourceType?: (typeof TAKEADS_SOURCE_TYPES)[number];

  @IsOptional()
  @IsIn(TAKEADS_OFFER_TYPES)
  offerType?: (typeof TAKEADS_OFFER_TYPES)[number];

  @IsOptional()
  @IsIn(TAKEADS_VISIBILITIES)
  visibility?: (typeof TAKEADS_VISIBILITIES)[number];

  @IsOptional()
  @IsString()
  merchantId?: string;
}

export class PublicTakeadsOfferQueryDto extends TakeadsPaginationDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsIn(TAKEADS_OFFER_TYPES)
  offerType?: (typeof TAKEADS_OFFER_TYPES)[number];

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class TakeadsReportQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsString()
  subId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}
