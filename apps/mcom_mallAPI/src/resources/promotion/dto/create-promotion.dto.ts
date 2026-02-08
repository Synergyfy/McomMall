import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionScope, PromotionType } from '../promotion.enum';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  termsAndConditions: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsDateString()
  @IsOptional()
  beginDate: Date;

  @IsDateString()
  @IsOptional()
  endDate: Date;

  @IsEnum(PromotionType)
  promotionType: PromotionType;

  @IsEnum(PromotionScope)
  promotionScope: PromotionScope;

  @IsInt()
  @IsOptional()
  multiplier: number;

  @IsInt()
  @IsOptional()
  bonusPoints: number;

  @IsInt()
  @IsOptional()
  limitPerCustomer: number;

  @IsNumber()
  @Type(() => Number)
  minimumSpend: number;

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  businessIds: string[];

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  includedProductIds: string[];

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  excludedProductIds: string[];
}
