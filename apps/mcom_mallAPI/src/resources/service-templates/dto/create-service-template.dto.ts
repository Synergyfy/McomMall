import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceTemplatePackageDto {
  @ApiProperty({ example: 'Basic Clean' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 120, description: 'Duration in minutes' })
  @IsNumber()
  @Min(0)
  duration: number;

  @ApiPropertyOptional({ example: 'Standard cleaning for 1-2 bedrooms.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['Kitchen', 'Bathroom'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
}

export class CreateServiceTemplateDto {
  @ApiProperty({ example: 'Home Cleaning' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Cleaning' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Standard home cleaning services.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [ServiceTemplatePackageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTemplatePackageDto)
  @IsOptional()
  packages?: ServiceTemplatePackageDto[];

  @ApiPropertyOptional({ example: ['Safety Gear', 'Insurance'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
