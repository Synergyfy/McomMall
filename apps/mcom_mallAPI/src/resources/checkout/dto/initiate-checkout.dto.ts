import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CheckoutItemDto {
  @ApiProperty({ description: 'The ID of the product.' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product.' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Selected variants for the product.' })
  @IsOptional()
  selectedVariants?: Record<string, string>;
}

export class InitiateCheckoutDto {
  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiPropertyOptional({
    description: 'The code of the gift card to apply to the checkout.',
  })
  @IsString()
  @IsOptional()
  giftCardCode?: string;

  @ApiPropertyOptional({
    description: 'The amount to redeem from the gift card (defaults to full balance).',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  giftCardAmount?: number;

  @ApiPropertyOptional({
    description: 'The code of the voucher to apply to the checkout.',
  })
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @ApiPropertyOptional({
    description: 'The amount to redeem from the voucher (defaults to full balance).',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  voucherAmount?: number;

  @ApiPropertyOptional({
    description: 'The ID of the coupon to apply to the checkout.',
  })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'The ID of the User Campaign Cashback to use for payment.',
  })
  @IsUUID()
  @IsOptional()
  campaignCashbackId?: string;

  @ApiPropertyOptional({ description: 'The ID of the shipping address.' })
  @IsUUID()
  @IsOptional()
  shippingAddressId?: string;

  @ApiPropertyOptional({ description: 'The carrier code (e.g., royalmail).' })
  @IsString()
  @IsOptional()
  carrierCode?: string;
}
