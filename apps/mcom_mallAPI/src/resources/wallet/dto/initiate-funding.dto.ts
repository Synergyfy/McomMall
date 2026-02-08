import { IsEnum, IsNumber, IsPositive, Min } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { Type } from 'class-transformer';

export class InitiateFundingDto {
  @IsNumber()
  @IsPositive()
  @Min(10)
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentProvider: PaymentMethod;
}
