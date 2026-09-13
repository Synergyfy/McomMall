import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGiftCardThemeDto {
  @ApiProperty({ description: 'Theme title' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Primary hex color' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary hex color' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Preview SVG or image URL' })
  @IsOptional()
  @IsString()
  previewSvg?: string;

  @ApiPropertyOptional({ description: 'Badge text overlay' })
  @IsOptional()
  @IsString()
  badgeText?: string;

  @ApiPropertyOptional({ description: 'Whether theme is public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
