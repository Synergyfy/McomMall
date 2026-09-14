import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @ApiProperty({
    description: 'Amount to withdraw in GBP',
    example: 100.0,
    minimum: 10,
  })
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiProperty({
    description: 'Payment method label (e.g. Bank Transfer, PayPal, Payoneer)',
    example: 'Bank Transfer',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    description: 'Account details for the withdrawal destination',
    example: '****3432',
  })
  @IsString()
  @IsNotEmpty()
  accountDetails: string;
}
