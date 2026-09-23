import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HighStreetStatus } from '../entities/high-street.entity';

export class CreateHighStreetDto {
  @ApiProperty({ example: 'Camden High Street' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Borough market mile with independent traders' })
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

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasPhysicalHub?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  hasVirtualHub?: boolean;

  @ApiPropertyOptional({ description: 'Owning borough UUID' })
  @IsUUID()
  @IsOptional()
  boroughId?: string;
}
