import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateGiftCardAssetDto {
  @ApiProperty({ description: 'The name of the gift card asset.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The URL of the gift card asset (GIF).' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'The category IDs to associate with the asset.',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  assetCategoryIds?: string[];
}
