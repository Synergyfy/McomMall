import { IsNumber, IsOptional, IsString, IsEnum, IsPositive, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '../enums/plan-type.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';

export class CreatePaymentIntentDto {
  @IsNumber()
  @IsPositive()
  @Max(50000)
  @IsOptional()
  amount?: number;

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

  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType;

  @IsEnum(PaymentPurpose)
  @IsOptional()
  purpose?: PaymentPurpose;
}
