import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissionStatus } from '../entities/quality-mission.entity';

export class CreateQualityMissionDto {
  @ApiProperty({ description: 'Business UUID under review' })
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ example: 'Agent 47' })
  @IsString()
  @IsNotEmpty()
  shopperName: string;

  @ApiPropertyOptional({ enum: MissionStatus })
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @ApiPropertyOptional({ example: 4.8 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  score?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '2026-03-01T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;
}
