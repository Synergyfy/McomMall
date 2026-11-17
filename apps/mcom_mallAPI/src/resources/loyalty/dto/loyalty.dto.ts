import {
  IsArray,
  IsEnum,
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

export class UpdateLoyaltySettingsDto {
  @IsOptional()
  isEnabled?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  pointsPerCurrency?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  pointsMultiplier?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  signupBonusPoints?: number;

  @IsString()
  @IsOptional()
  redemptionApproval?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsOptional()
  programName?: string;

  @IsString()
  @IsOptional()
  brandColor?: string;

  @IsString()
  @IsOptional()
  accentColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  heroImageUrl?: string;

  @ApiPropertyOptional({ type: [LoyaltyTierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoyaltyTierDto)
  @IsOptional()
  tierConfig?: LoyaltyTierDto[];

  @IsString()
  @IsOptional()
  redemptionMode?: string;

  @IsOptional()
  redemptionValue?: number;
}
