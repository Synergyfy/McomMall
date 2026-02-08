import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class PriceModifierDto {
  @IsUUID()
  businessId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @Min(0)
  priceMultiplier: number;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;
}
