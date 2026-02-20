import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
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

export class CreateGiftCardSettingsDto {
  @ApiProperty({
    description: 'Enable or disable the gift card feature for the owner.',
  })
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({
    description: 'Allow customers to schedule gift card delivery.',
  })
  @IsBoolean()
  allowDeliveryScheduling: boolean;

  @ApiProperty({
    description: 'Allow customers to add a personal message.',
  })
  @IsBoolean()
  allowPersonalMessage: boolean;

  @ApiProperty({
    description: 'Enable QR codes on gift card emails.',
  })
  @IsBoolean()
  enableQrCode: boolean;

  @ApiProperty({
    description: 'Allow customers to reload gift cards.',
  })
  @IsBoolean()
  allowReloading: boolean;

  @ApiProperty({
    description: 'Rules for how gift cards can be redeemed.',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RedemptionRulesDto)
  redemptionRules: RedemptionRulesDto;
}