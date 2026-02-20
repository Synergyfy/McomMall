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

class ServiceBookingDetailsDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

class PaymentDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  transactionId: string;

  @IsNumber()
  amount: number;
}

class DirectPurchaseDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsOptional()
  variant?: Record<string, string>;
}

export class CreateCheckoutDto {
  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DirectPurchaseDto)
  directPurchase?: DirectPurchaseDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseGiftCardDto)
  @IsOptional()
  giftCardPurchases?: PurchaseGiftCardDto[];

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsUUID()
  @IsOptional()
  offerId?: string;

  @IsString()
  @IsOptional()
  giftCardCode?: string; // For redeeming

  @IsString()
  @IsOptional()
  voucherCode?: string;

  @IsNumber()
  @IsOptional()
  giftCardAmount?: number;

  @IsNumber()
  @IsOptional()
  voucherAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceBookingDetailsDto)
  @IsOptional()
  serviceBookings?: ServiceBookingDetailsDto[];
}