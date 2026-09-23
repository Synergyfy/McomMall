import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceTemplatePackageDto } from './create-service-template.dto';

export class UpdateServiceTemplateDto {
  @ApiPropertyOptional({ example: 'Home Cleaning' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Cleaning' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [ServiceTemplatePackageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTemplatePackageDto)
  @IsOptional()
  packages?: ServiceTemplatePackageDto[];

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
