import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEmail,
  IsOptional,
  IsUUID,
  IsIn,
  IsDateString,
} from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

export class InitiateVoucherPurchaseDto {
  @ApiProperty({
    description: 'The ID of the VoucherProduct being purchased.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  voucherProductId: string;

  @ApiProperty({
    description: 'The amount of the voucher.',
    example: 25.0,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'The payment provider to use.',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @IsNotEmpty()
  @IsIn(Object.values(PaymentMethod))
  paymentProvider: PaymentMethod;

  @ApiProperty({
    description: "The recipient's name (optional).",
    required: false,
  })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiProperty({ description: "The recipient's email address (optional)." })
  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @ApiProperty({ description: 'A personal message (optional).' })
  @IsString()
  @IsOptional()
  personalMessage?: string;

  @ApiProperty({
    description: 'Scheduled delivery date in ISO 8601 format (optional).',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  deliveryDate?: string;
}