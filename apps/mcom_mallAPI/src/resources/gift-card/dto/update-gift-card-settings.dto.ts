import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RedemptionRulesDto {
  @ApiProperty()
  @IsBoolean()
  canBeUsedWithDiscounts: boolean;

  @ApiProperty()
  @IsBoolean()
  canApplyToShipping: boolean;

  @ApiProperty()
  @IsBoolean()
  canApplyToTax: boolean;
}

export class UpdateGiftCardSettingsDto {
  @ApiProperty({
    description: 'Enable or disable the gift card feature for the business.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({
    description: 'Allow customers to schedule gift card delivery.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowDeliveryScheduling?: boolean;

  @ApiProperty({
    description: 'Allow customers to add a personal message.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowPersonalMessage?: boolean;

  @ApiProperty({
    description: 'Enable QR codes on gift card emails.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enableQrCode?: boolean;

  @ApiProperty({
    description: 'Allow customers to reload gift cards.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allowReloading?: boolean;

  @ApiProperty({
    description: 'Rules for how gift cards can be redeemed.',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RedemptionRulesDto)
  @IsOptional()
  redemptionRules?: RedemptionRulesDto;
}