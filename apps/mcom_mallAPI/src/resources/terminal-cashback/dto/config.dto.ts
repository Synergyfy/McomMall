import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TerminalLevel } from '../entities/terminal-config.entity';

class RangeDto {
  @ApiProperty({ example: 'range_1', description: 'Unique ID for this range' })
  @IsString()
  id: string;

  @ApiProperty({ example: 10.0, description: 'Minimum spend amount' })
  @IsNumber()
  minSpend: number;

  @ApiProperty({ example: 50.0, description: 'Maximum spend amount' })
  @IsNumber()
  maxSpend: number;

  @ApiProperty({ example: 2.0, description: 'Cashback reward value' })
  @IsNumber()
  rewardValue: number;

  @ApiProperty({ example: true, description: 'Is this range active?' })
  @IsBoolean()
  isActive: boolean;
}

class LimitsDto {
  @ApiProperty({
    example: 500,
    description: 'Max total cashback per day',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxPerDay: number;

  @ApiProperty({
    example: 50,
    description: 'Max cashback per customer lifetime',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxPerCustomer: number;

  @ApiProperty({
    example: 10,
    description: 'Max cashback per single receipt',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxPerReceipt: number;

  @ApiProperty({
    example: 5000,
    description: 'Max monthly budget for the terminal',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  monthlyBudget: number;

  @ApiProperty({
    example: 3,
    description: 'Max claims per user per day/period',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxClaimsPerUser: number;
}

export class CreateTerminalConfigDto {
  @ApiProperty({ example: 'user-uuid-here', description: 'Unique Owner ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'John Doe', description: 'Owner Display Name' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ enum: TerminalLevel, example: TerminalLevel.VERIFIED_L1 })
  @IsEnum(TerminalLevel)
  level: TerminalLevel;

  @ApiProperty({
    type: [RangeDto],
    description: 'List of reward ranges (for Level 1)',
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RangeDto)
  ranges?: RangeDto[];

  @ApiPropertyOptional({
    example: 1.5,
    description: 'Fixed reward amount for Level 2',
  })
  @IsNumber()
  @IsOptional()
  fixedRewardValue?: number;

  @ApiPropertyOptional({
    example: 'https://api.merchant.com/verify',
    description: 'External POS endpoint for Level 3',
  })
  @IsUrl()
  @IsOptional()
  apiEndpoint?: string;

  @ApiProperty({
    type: LimitsDto,
    description: 'Spending limits and guardrails',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LimitsDto)
  limits?: LimitsDto;
}

export class UpdateTerminalConfigDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ enum: TerminalLevel, required: false })
  @IsOptional()
  @IsEnum(TerminalLevel)
  level?: TerminalLevel;

  @ApiProperty({ example: 48, required: false })
  @IsOptional()
  @IsNumber()
  autoApprovalHours?: number;

  @ApiProperty({ type: [RangeDto], required: false })
  @IsOptional()
  ranges?: RangeDto[];

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @IsOptional()
  fixedRewardValue?: number;

  @ApiPropertyOptional({ example: 'https://api.merchant.com/verify' })
  @IsUrl()
  @IsOptional()
  apiEndpoint?: string;

  @ApiProperty({ type: LimitsDto, required: false })
  @IsOptional()
  limits?: LimitsDto;
}
