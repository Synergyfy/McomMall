import {
  IsBoolean,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsNotEmpty()
  planType: PlanType;

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
  transactionId: string; // Stripe intent id or PayPal order id

  @IsEnum(PaymentPurpose)
  @IsOptional()
  purpose?: PaymentPurpose;

  @IsString()
  @IsOptional()
  tierId?: string;
}
