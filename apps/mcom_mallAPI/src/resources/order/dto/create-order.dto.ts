import { IsString, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order-payment.entity';

class OrderPaymentDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  amount: number;

  @IsString()
  transactionId: string;
}

export class CreateOrderDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @ValidateNested()
  @Type(() => OrderPaymentDto)
  payment: OrderPaymentDto;
}
