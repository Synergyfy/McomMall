import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class CreateGamificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  gameType: string;

  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @IsString()
  @IsNotEmpty()
  rewardValue: string;

  @IsInt()
  @IsOptional()
  rewardQty?: number;

  @IsBoolean()
  @IsOptional()
  isLimitedTime?: boolean;

  @IsBoolean()
  @IsOptional()
  dailyLimitEnabled?: boolean;

  @IsInt()
  @IsOptional()
  dailyLimitValue?: number;

  @IsBoolean()
  @IsOptional()
  loyaltyOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  minSpendEnabled?: boolean;

  @IsString()
  @IsOptional()
  minSpendCurrency?: string;

  @IsNumber()
  @IsOptional()
  minSpendValue?: number;

  @IsBoolean()
  @IsOptional()
  qrUnlockEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  boroughRulesEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  boroughs?: string[];

  @IsString()
  @IsOptional()
  status?: string;
}
