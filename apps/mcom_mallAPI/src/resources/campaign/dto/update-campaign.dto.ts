import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AdPlacement, CampaignType } from '../campaign.enum';

export class UpdateCampaignDto {
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  displayOnlyIfCategory?: string;

  @IsString()
  @IsOptional()
  displayOnlyIfRegion?: string;

  @IsBoolean()
  @IsOptional()
  enabledForLoggedInUser?: boolean;

  @IsArray()
  @IsEnum(AdPlacement, { each: true })
  @IsOptional()
  adPlacement?: AdPlacement[];
}
