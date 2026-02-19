import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { MarketingCampaignType, MarketingCampaignStatus } from '../marketing-campaign.enum';

export class CreateMarketingCampaignDto {
  @ApiProperty({ description: 'Name of the campaign', example: 'Winter Promo 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Type of the campaign', 
    enum: MarketingCampaignType,
    example: MarketingCampaignType.SEASONAL 
  })
  @IsEnum(MarketingCampaignType)
  @IsNotEmpty()
  type: MarketingCampaignType;

  @ApiProperty({ description: 'Campaign start date', type: Date })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ description: 'Campaign end date', type: Date })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiPropertyOptional({ 
    description: 'Status of the campaign', 
    enum: MarketingCampaignStatus,
    default: MarketingCampaignStatus.DRAFT 
  })
  @IsEnum(MarketingCampaignStatus)
  @IsOptional()
  status?: MarketingCampaignStatus;

  @ApiPropertyOptional({ description: 'Season ID to link this campaign to', format: 'uuid' })
  @IsString()
  @IsOptional()
  seasonId?: string;

  @ApiPropertyOptional({ 
    description: 'Target postal code prefixes for hyperlocal campaigns (UK format)', 
    example: ['SW1A', 'W1B'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetPostalCodes?: string[];
}

export class UpdateMarketingCampaignDto extends PartialType(CreateMarketingCampaignDto) {}
