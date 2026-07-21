import {
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
  IsOptional,
  IsArray,
  IsUUID,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order-payment.entity';
import { PurchaseGiftCardDto } from '../../gift-card/dto/purchase-gift-card.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ServiceBookingDetailsDto {
  @ApiProperty({ description: 'The ID of the service to book.' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Start time of the booking (ISO date string).' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time of the booking (ISO date string).' })
  @IsDateString()
  endTime: string;
}

class PaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    description: 'The method used for payment.',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description:
      'The transaction ID from the payment provider (Stripe/PayPal).',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'The total amount paid.', example: 14.5 })
  @IsNumber()
  amount: number;
}

class DirectPurchaseDto {
  @ApiProperty({ description: 'The ID of the product to purchase.' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product.', example: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Selected variants for the product (e.g. { size: "XL" }).',
  })
  @IsOptional()
  variant?: Record<string, string>;
}

export class CreateCheckoutDto {
  @ApiProperty({
    type: PaymentDto,
    description: 'Payment details for the order.',
  })
  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @ApiPropertyOptional({
    type: DirectPurchaseDto,
    description: 'Direct purchase details (if not using cart).',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DirectPurchaseDto)
  directPurchase?: DirectPurchaseDto;

  @ApiPropertyOptional({
    type: [PurchaseGiftCardDto],
    description: 'Gift cards being purchased in this transaction.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseGiftCardDto)
  @IsOptional()
  giftCardPurchases?: PurchaseGiftCardDto[];

  @ApiPropertyOptional({ description: 'Coupon code to apply.' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Offer ID to redeem using points.' })
  @IsUUID()
  @IsOptional()
  offerId?: string;

  @ApiPropertyOptional({ description: 'Gift card code to use for payment.' })
  @IsString()
  @IsOptional()
  giftCardCode?: string;

  @ApiPropertyOptional({ description: 'Voucher code to use for payment.' })
  @IsString()
  @IsOptional()
  voucherCode?: string;

  @ApiPropertyOptional({ description: 'Amount to deduct from gift card.' })
  @IsNumber()
  @IsOptional()
  giftCardAmount?: number;

  @ApiPropertyOptional({ description: 'Amount to deduct from voucher.' })
  @IsNumber()
  @IsOptional()
  voucherAmount?: number;

  @ApiPropertyOptional({
    type: [ServiceBookingDetailsDto],
    description: 'Services to book along with the product.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceBookingDetailsDto)
  @IsOptional()
  serviceBookings?: ServiceBookingDetailsDto[];

  @ApiPropertyOptional({
    description:
      'The ID of the shipping address (required for physical products).',
  })
  @IsUUID()
  @IsOptional()
  shippingAddressId?: string;

  @ApiPropertyOptional({ description: 'The carrier code (e.g. "royalmail").' })
  @IsString()
  @IsOptional()
  carrierCode?: string;
}
