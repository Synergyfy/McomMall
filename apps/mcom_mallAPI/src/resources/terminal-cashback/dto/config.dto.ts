import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TerminalLevel } from '../entities/terminal-config.entity';

class RangeDto {
  @ApiProperty({ example: 'range_1', description: 'Unique ID for this range' })
  @IsString()
  id: string;

  @ApiProperty({ example: 10.00, description: 'Minimum spend amount' })
  @IsNumber()
  minSpend: number;

  @ApiProperty({ example: 50.00, description: 'Maximum spend amount' })
  @IsNumber()
  maxSpend: number;

  @ApiProperty({ example: 2.00, description: 'Cashback reward value' })
  @IsNumber()
  rewardValue: number;

  @ApiProperty({ example: true, description: 'Is this range active?' })
  @IsBoolean()
  isActive: boolean;
}

class LimitsDto {
  @ApiProperty({ example: 500, description: 'Max total cashback per day', required: false })
  @IsNumber()
  @IsOptional()
  maxPerDay: number;

  @ApiProperty({ example: 50, description: 'Max cashback per customer lifetime', required: false })
  @IsNumber()
  @IsOptional()
  maxPerCustomer: number;

  @ApiProperty({ example: 10, description: 'Max cashback per single receipt', required: false })
  @IsNumber()
  @IsOptional()
  maxPerReceipt: number;

  @ApiProperty({ example: 5000, description: 'Max monthly budget for the terminal', required: false })
  @IsNumber()
  @IsOptional()
  monthlyBudget: number;

  @ApiProperty({ example: 3, description: 'Max claims per user per day/period', required: false })
  @IsNumber()
  @IsOptional()
  maxClaimsPerUser: number;
}

export class CreateTerminalConfigDto {
  @ApiProperty({ example: 'BEANTHERE01', description: 'Unique Business ID' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ example: 'Bean There Coffee', description: 'Business Display Name' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ enum: TerminalLevel, example: TerminalLevel.VERIFIED_L1 })
  @IsEnum(TerminalLevel)
  level: TerminalLevel;

  @ApiProperty({ type: [RangeDto], description: 'List of reward ranges (for Level 1)', required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RangeDto)
  ranges?: RangeDto[];

  @ApiProperty({ type: LimitsDto, description: 'Spending limits and guardrails', required: false })
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

    @ApiProperty({ type: LimitsDto, required: false })
    @IsOptional()
    limits?: LimitsDto;
}