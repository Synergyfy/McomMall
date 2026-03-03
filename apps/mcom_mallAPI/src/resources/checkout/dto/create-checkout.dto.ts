import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
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

export class CreateCheckoutDto {
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
}
