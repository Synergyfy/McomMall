import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { InitiateVoucherPurchaseDto } from './initiate-voucher-purchase.dto';

export class VerifyVoucherPurchaseDto {
  @ApiProperty({
    description: 'The payment provider that was used.',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @IsNotEmpty()
  @IsIn(Object.values(PaymentMethod))
  paymentProvider: PaymentMethod;

  @ApiProperty({
    description:
      'The payment identifier from the provider (e.g., Stripe PaymentIntent ID, PayPal Order ID).',
    example: 'pi_1J2j3k4L5m6n7o8p9q0r',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The original details of the voucher purchase initiation.',
  })
  @ValidateNested()
  @Type(() => InitiateVoucherPurchaseDto)
  purchaseDetails: InitiateVoucherPurchaseDto;
}