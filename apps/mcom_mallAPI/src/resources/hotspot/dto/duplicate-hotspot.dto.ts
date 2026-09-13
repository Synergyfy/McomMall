import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DuplicateHotspotCampaignDto {
  @ApiPropertyOptional({
    description: 'New title for the duplicated campaign',
    example: 'Copy of Summer Sale Hotspot',
  })
  @IsOptional()
  @IsString()
  newTitle?: string;
}
