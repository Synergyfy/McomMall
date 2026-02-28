import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class InitiateContributionPaymentDto {
  @ApiProperty({
    description: 'The payment provider to use for the contribution.',
    enum: PaymentMethod,
    example: 'stripe',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentProvider: PaymentMethod;
}
