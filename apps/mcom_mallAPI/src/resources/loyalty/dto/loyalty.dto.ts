import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  LoyaltyRuleTrigger,
  LoyaltyRuleType,
} from '../entities/loyalty-rule.entity';
import { LoyaltyTier } from '../entities/loyalty-settings.entity';

export class LoyaltyTierDto implements LoyaltyTier {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  minPoints: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateLoyaltyRuleDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LoyaltyRuleType)
  @IsNotEmpty()
  ruleType: LoyaltyRuleType;

  @IsInt()
  @Min(0)
  @IsOptional()
  pointsPerCurrency?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  fixedPoints?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  multiplier?: number;

  @IsString()
  @IsOptional()
  appliesTo?: string;

  @IsEnum(LoyaltyRuleTrigger)
  @IsOptional()
  trigger?: LoyaltyRuleTrigger;

  @IsString()
  @IsOptional()
  targetSegment?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  frequencyLimit?: number;

  @IsOptional()
  minSpend?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateLoyaltyRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LoyaltyRuleType)
  @IsOptional()
  ruleType?: LoyaltyRuleType;

  @IsInt()
  @Min(0)
  @IsOptional()
  pointsPerCurrency?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  fixedPoints?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  multiplier?: number;

  @IsString()
  @IsOptional()
  appliesTo?: string;

  @IsEnum(LoyaltyRuleTrigger)
  @IsOptional()
  trigger?: LoyaltyRuleTrigger;

  @IsString()
  @IsOptional()
  targetSegment?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  frequencyLimit?: number;

  @IsOptional()
  minSpend?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpsertLoyaltyEarningConfigDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  earnOnProducts?: boolean;

  @IsOptional()
  @IsBoolean()
  earnOnServices?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsPerCurrency?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fixedPointsPerOrder?: number;

  @IsOptional()
  minSpend?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  includedProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  excludedProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  includedServiceIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  excludedServiceIds?: string[];

  @IsOptional()
  @IsObject()
  productPointOverrides?: Record<string, number>;

  @IsOptional()
  @IsObject()
  servicePointOverrides?: Record<string, number>;
}

export class JoinLoyaltyProgramDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;
}
