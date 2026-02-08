import { IsEnum, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { Type } from 'class-transformer';

export class VerifyFundingDto {
  @IsString()
  transactionId: string;

  @IsNumber()
  @IsPositive()
  @Min(10)
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentProvider: PaymentMethod;
}
