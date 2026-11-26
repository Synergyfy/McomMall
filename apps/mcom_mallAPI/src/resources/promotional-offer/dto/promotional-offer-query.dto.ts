import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PromotionalOfferQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['product', 'service', 'offer'])
  offeringType?: 'product' | 'service' | 'offer';

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive', 'archived'])
  status?: 'draft' | 'active' | 'inactive' | 'archived';

  @IsOptional()
  @IsIn(['all', 'selected'])
  availability?: 'all' | 'selected';

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  subCategoryId?: string;

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

  @IsOptional()
  @IsString()
  businessId?: string;
}

export class PublicPromotionalOfferQueryDto {
  @IsOptional()
  @IsIn(['product', 'service', 'offer'])
  offeringType?: 'product' | 'service' | 'offer';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  subCategoryId?: string;

  /** When present, only offers imported by this business are returned. */
  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;
}

export class AffiliateReportQueryDto {
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
  limit?: number = 50;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class SyncAwinTransactionsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ImportPromotionalOfferDto {
  @IsOptional()
  @IsString()
  businessId?: string;
}
