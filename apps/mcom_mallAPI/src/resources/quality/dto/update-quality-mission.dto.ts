import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MissionStatus } from '../entities/quality-mission.entity';

export class UpdateQualityMissionDto {
  @ApiPropertyOptional({ description: 'Business UUID under review' })
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shopperName?: string;

  @ApiPropertyOptional({ enum: MissionStatus })
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  score?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;
}
