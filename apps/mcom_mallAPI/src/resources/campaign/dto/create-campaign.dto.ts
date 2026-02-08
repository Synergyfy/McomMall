import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AdPlacement, CampaignType } from '../campaign.enum';

export class CreateCampaignDto {
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @IsEnum(CampaignType)
  @IsNotEmpty()
  type: CampaignType;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsNotEmpty()
  budget: number;

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
  @IsNotEmpty()
  adPlacement: AdPlacement[];
}
