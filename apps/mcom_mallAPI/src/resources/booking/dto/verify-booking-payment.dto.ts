import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class VerifyBookingPaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentProvider: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  transactionId: string;
}
