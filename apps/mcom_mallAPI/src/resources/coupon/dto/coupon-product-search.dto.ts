import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationFilterDto } from '../../geography/dto/location-filter.dto';

export class CouponProductSearchDto extends LocationFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Filter by business ID' })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({ description: 'Filter by business name' })
  @IsOptional()
  @IsString()
  businessName?: string;
}
