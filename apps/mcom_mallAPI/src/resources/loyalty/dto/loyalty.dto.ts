import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { LoyaltyRuleType } from '../entities/loyalty-rule.entity';

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
}
