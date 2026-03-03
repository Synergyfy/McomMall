import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export enum ContributionPaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  WALLET = 'wallet',
}

export class ContributeDto {
  @ApiProperty({
    example: 10,
    description: 'The exact amount to contribute (should be 1/3 of totalValue)',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: ContributionPaymentProvider,
    example: ContributionPaymentProvider.STRIPE,
    description: 'Payment method used: stripe, paypal, or wallet',
  })
  @IsEnum(ContributionPaymentProvider)
  paymentMethod: ContributionPaymentProvider;

  @ApiProperty({
    example: 'pi_3O8abc123xyz',
    description:
      'Transaction ID from external provider (required for stripe/paypal)',
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionId?: string;
}
