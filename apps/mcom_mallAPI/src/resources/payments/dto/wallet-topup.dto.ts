import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class InitiateWalletTopUpDto {
  @ApiPropertyOptional({
    description: 'Amount to top up in GBP (Solutions limits: 5–500).',
    example: 170,
  })
  @IsNumber()
  @Min(5)
  @Max(500)
  amount: number;

  @ApiPropertyOptional({ description: 'Fiat currency.', default: 'GBP' })
  @IsString()
  @IsOptional()
  currency?: string;
}

export class ConfirmWalletTopUpDto {
  @ApiPropertyOptional({
    description: 'Top-up request id returned by initiate.',
  })
  @IsString()
  @IsNotEmpty()
  topUpRequestId: string;

  @ApiPropertyOptional({
    description: 'Stripe PaymentIntent id confirmed in the browser.',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiPropertyOptional({
    description: 'Preferred provider (Solutions currently settles via Stripe).',
    default: 'stripe',
  })
  @IsString()
  @IsOptional()
  @IsIn(['stripe', 'paypal'])
  provider?: string;
}
