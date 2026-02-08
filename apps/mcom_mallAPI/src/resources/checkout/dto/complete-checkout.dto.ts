import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class CompleteCheckoutDto {
  @ApiProperty({
    description: 'The ID of the order created during the initiate step.',
  })
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional({
    description: 'The payment provider that was used, if payment was required.',
    enum: PaymentMethod,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentProvider?: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'The payment identifier from the provider (e.g., Stripe PaymentIntent ID, PayPal Order ID), if payment was required.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  transactionId?: string;
}