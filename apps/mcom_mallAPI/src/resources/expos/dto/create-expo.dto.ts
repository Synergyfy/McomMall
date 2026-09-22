import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpoStatus } from '../entities/expo.entity';

export class CreateExpoDto {
  @ApiProperty({ example: 'Summer Night Market' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Camden Lock Plaza' })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ enum: ExpoStatus })
  @IsEnum(ExpoStatus)
  @IsOptional()
  status?: ExpoStatus;

  @ApiPropertyOptional({ example: '2026-07-01T18:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-03T23:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Host borough UUID' })
  @IsUUID()
  @IsOptional()
  boroughId?: string;
}
