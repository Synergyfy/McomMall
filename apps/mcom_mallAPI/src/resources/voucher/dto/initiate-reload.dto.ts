import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class InitiateReloadDto {
  @ApiProperty({ description: 'The amount to reload.', example: 25.5 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'The payment provider to use.',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @IsString()
  @IsNotEmpty()
  paymentProvider: PaymentMethod;
}