import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/order-payment.entity';
import { QuoteCheckoutDto } from './quote-checkout.dto';

/**
 * Creates the MCOM Pay charge for a checkout *before* the buyer pays.
 *
 * The quote is re-priced server-side and frozen on the intent, so the charge
 * amount and payee splits are never taken from the browser. Stripe/PayPal only;
 * wallet orders continue to settle through `/order/checkout`.
 */
export class CreateOrderPaymentIntentDto {
  @ApiProperty({ type: QuoteCheckoutDto })
  @ValidateNested()
  @Type(() => QuoteCheckoutDto)
  quote: QuoteCheckoutDto;

  @ApiProperty({ enum: [PaymentMethod.STRIPE, PaymentMethod.PAYPAL] })
  @IsEnum(PaymentMethod)
  paymentProvider: PaymentMethod;

  @ApiProperty({ description: 'Deterministic key for this payment attempt.' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiPropertyOptional({
    description: 'Where PayPal should return the buyer after approval.',
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'Where PayPal should send a cancelling buyer.',
  })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
