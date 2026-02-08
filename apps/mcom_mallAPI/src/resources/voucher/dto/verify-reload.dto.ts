import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

class ReloadDetailsDto {
  @ApiProperty({
    description: 'The amount to reload.',
    example: 25.5,
  })
  @IsNumber()
  amount: number;
}

export class VerifyReloadDto {
  @ApiProperty({ type: () => ReloadDetailsDto })
  @ValidateNested()
  @Type(() => ReloadDetailsDto)
  reloadDetails: ReloadDetailsDto;

  @ApiProperty({
    description: 'The payment provider used.',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @IsString()
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @ApiProperty({
    description: 'The transaction ID from the payment provider.',
    example: 'pi_...',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}