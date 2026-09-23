import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HighStreetStatus } from '../entities/high-street.entity';

export class UpdateHighStreetDto {
  @ApiPropertyOptional({ example: 'Camden High Street' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: HighStreetStatus })
  @IsEnum(HighStreetStatus)
  @IsOptional()
  status?: HighStreetStatus;

  @ApiPropertyOptional({ example: 51.539 })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: -0.142 })
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasPhysicalHub?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasVirtualHub?: boolean;

  @ApiPropertyOptional({ description: 'Owning borough UUID' })
  @IsUUID()
  @IsOptional()
  boroughId?: string;
}
