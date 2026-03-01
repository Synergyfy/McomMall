import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';
import { ProductAttribute } from '../interfaces/product-variant.interface';

export class CreateProductVariantTemplateDto {
  @ApiProperty({
    description: 'The name of the template',
    example: 'Clothing Standard',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The product type this template applies to',
    example: 'physical',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['physical', 'virtual', 'downloadable'])
  productType: string;

  @ApiPropertyOptional({
    description: 'The category this template applies to',
    example: 'Clothing',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'The sub-category this template applies to',
    example: 'T-Shirts',
  })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiProperty({ description: 'Predefined attributes for this template' })
  @IsArray()
  @IsNotEmpty()
  attributes: ProductAttribute[];
}
