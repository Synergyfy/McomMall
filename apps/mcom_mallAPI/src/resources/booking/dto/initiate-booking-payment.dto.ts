import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
}
