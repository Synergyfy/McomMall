import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderTrackingDto {
  @IsString()
  @MaxLength(64)
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  carrierCode?: string;
}
