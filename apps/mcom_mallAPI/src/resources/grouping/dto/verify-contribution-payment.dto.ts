import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class VerifyContributionPaymentDto {
  @ApiProperty({
    description: 'The payment provider that was used.',
    enum: PaymentMethod,
    example: 'stripe',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @ApiProperty({
    description:
      'The payment identifier from the provider (e.g., Stripe PaymentIntent ID, PayPal Order ID).',
    example: 'pi_123abc_xyz',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}