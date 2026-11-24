import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignItemDto {
  @ApiPropertyOptional({ enum: ['product', 'service', 'promotional_offer', 'link'] })
  @IsOptional()
  @IsIn(['product', 'service', 'promotional_offer', 'link'])
  itemType: 'product' | 'service' | 'promotional_offer' | 'link';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  offerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerBusinessId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advertiserBusinessId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(240)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinationUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;
}

export class PromotionalMaterialDto {
  @IsIn(['image', 'link'])
  type: 'image' | 'link';

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class CreatePromotionalCampaignDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'inactive'] })
  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ['voucher', 'discount', 'cashback', 'gift', 'other'],
  })
  @IsOptional()
  @IsIn(['voucher', 'discount', 'cashback', 'gift', 'other'])
  rewardType?: 'voucher' | 'discount' | 'cashback' | 'gift' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rewardTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rewardDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rewardValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  availableToAll?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [PromotionalMaterialDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionalMaterialDto)
  promotionalMaterials?: PromotionalMaterialDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessIds?: string[];

  @ApiPropertyOptional({ type: [CampaignItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignItemDto)
  items?: CampaignItemDto[];
}

export class UpdatePromotionalCampaignDto extends PartialType(
  CreatePromotionalCampaignDto,
) {}

export class RespondToCampaignDto {
  @IsIn(['accepted', 'declined', 'withdrawn'])
  status: 'accepted' | 'declined' | 'withdrawn';

  @IsOptional()
  @IsString()
  note?: string;
}

export class PromotionalCampaignQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
