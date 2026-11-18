import {
  IsBoolean,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '../enums/plan-type.enum';
import { PaygOption } from '../enums/payg-option.enum';
import { PaymentGateway } from '../enums/payment-gateway.enum';

import { PaymentPurpose } from '../enums/payment-purpose.enum';

export class RecordPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string; // default to 'gbp' if not provided

  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType = PlanType.MONTHLY;

  @IsEnum(PaygOption)
  @IsOptional()
  paygOption?: PaygOption;

  @IsBoolean()
  @IsNotEmpty()
  isTrial: boolean;

  @IsEnum(PaymentGateway)
  @IsNotEmpty()
  paymentGateway: PaymentGateway;

  @IsString()
  @IsNotEmpty()
  transactionId: string; // Stripe intent id, PayPal order id, or MCOM Wallet hold id

  @IsString()
  @IsOptional()
  holdId?: string; // MCOM Wallet hold id to capture (defaults to transactionId)

  @IsEnum(PaymentPurpose)
  @IsOptional()
  purpose?: PaymentPurpose;

  @IsString()
  @IsOptional()
  tierId?: string;

  @ApiPropertyOptional({
    description:
      'Plan variant id (new plans model). Takes precedence over tierId.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsOptional()
  planVariantId?: string;
}
