import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlanConfigurationDto } from './create-plan.dto';

export class UpdatePlanDto {
  @ApiPropertyOptional({
    example: 'Gold',
    description: 'Display name of the plan family',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'gold', description: 'URL-safe unique slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'For established businesses' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanVariantDto {
  @ApiPropertyOptional({
    example: ['Priority support'],
    description: 'Display-only bullet list for pricing pages',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ type: CreatePlanConfigurationDto })
  @ValidateNested()
  @Type(() => CreatePlanConfigurationDto)
  @IsObject()
  @IsOptional()
  configuration?: CreatePlanConfigurationDto;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
