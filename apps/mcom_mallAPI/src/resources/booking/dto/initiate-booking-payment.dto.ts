import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class InitiateBookingPaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentProvider: PaymentMethod;

  @IsOptional()
  @IsString()
  rewardIssuanceId?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  couponAmount?: number;

  @IsOptional()
  @IsString()
  giftCardCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  giftCardAmount?: number;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  voucherAmount?: number;
}
