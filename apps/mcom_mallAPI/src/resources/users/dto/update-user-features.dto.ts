import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserFeaturesDto {
  @IsOptional()
  @IsBoolean()
  giftCard?: boolean;

  @IsOptional()
  @IsBoolean()
  voucher?: boolean;

  @IsOptional()
  @IsBoolean()
  promotion?: boolean;
}
