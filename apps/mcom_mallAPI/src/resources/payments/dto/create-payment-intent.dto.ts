import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PlanType } from '../enums/plan-type.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';

export class CreatePaymentIntentDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  tierId?: string;

  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType;

  @IsEnum(PaymentPurpose)
  @IsOptional()
  purpose?: PaymentPurpose;
}
