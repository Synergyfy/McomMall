import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateHotspotDto } from './create-hotspot-campaign.dto';

export class UpdateHotspotCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHotspotDto)
  @IsOptional()
  hotspots?: CreateHotspotDto[];
}
