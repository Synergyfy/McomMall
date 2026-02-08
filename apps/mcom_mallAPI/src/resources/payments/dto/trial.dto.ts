import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsDate, IsNumber } from 'class-validator';
import { PlanType } from '../enums/plan-type.enum';
import { PaygOption } from '../enums/payg-option.enum';

export class TrialDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiProperty({ enum: PaygOption, nullable: true })
  @IsEnum(PaygOption)
  paygOption: PaygOption;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsBoolean()
  isPaused: boolean;

  @ApiProperty()
  @IsNumber()
  pauseCount: number;

  @ApiProperty()
  @IsDate()
  startedAt: Date;

  @ApiProperty({ type: Date, nullable: true })
  @IsDate()
  pausedAt: Date | null;

  @ApiProperty()
  @IsNumber()
  totalPausedDuration: number;
}
