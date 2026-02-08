import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

class ReloadDetailsDto {
  @ApiProperty({ description: 'The amount that was reloaded.' })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class VerifyReloadDto {
  @ApiProperty({
    description: 'The payment provider used for the transaction.',
    enum: PaymentMethod,
  })
  @IsString()
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @ApiProperty({
    description:
      'The transaction ID from the payment provider (e.g., Stripe Payment Intent ID, PayPal Order ID).',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ type: () => ReloadDetailsDto })
  @ValidateNested()
  @Type(() => ReloadDetailsDto)
  reloadDetails: ReloadDetailsDto;
}