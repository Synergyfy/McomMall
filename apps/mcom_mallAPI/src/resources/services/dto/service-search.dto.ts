import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationFilterDto } from '../../geography/dto/location-filter.dto';

export class ServiceSearchDto extends LocationFilterDto {
  @ApiPropertyOptional({
    description: 'Search by name or description',
    example: 'cleaning',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum price (fixedPrice or basePrice)',
    example: 10.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum price (fixedPrice or basePrice)',
    example: 500.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
