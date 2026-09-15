import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { MembershipTier } from '../membership-tier.enum';

export enum PlanType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

export class InitiateMembershipPaymentDto {
  @ApiPropertyOptional({
    description: 'The tier enum of the membership being purchased (legacy).',
    enum: MembershipTier,
    example: 'professional',
  })
  @IsEnum(MembershipTier)
  @IsOptional()
  tier?: MembershipTier;

  @ApiPropertyOptional({
    description: 'The ID of the new Tier entity.',
  })
  @IsString()
  @IsOptional()
  tierId?: string;

  @ApiPropertyOptional({
    description:
      'Plan variant id (new plans model). Takes precedence over tierId.',
  })
  @IsString()
  @IsOptional()
  planVariantId?: string;

  @ApiProperty({
    description: 'Plan type (monthly or annual).',
    enum: PlanType,
    default: PlanType.MONTHLY,
  })
  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType = PlanType.MONTHLY;

  @ApiProperty({
    description: 'The payment provider to use.',
    enum: PaymentMethod,
    example: 'stripe',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'Deterministic idempotency key for MCOM Wallet holds. Reuse the same key on retries to prevent duplicate holds.',
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description:
      'PayPal return URL (frontend) the user lands on after approving the payment on paypal.com. Only used for PayPal via MCOM Solutions.',
    example: 'https://mall.example.com/pricing?paypal=return',
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ApiPropertyOptional({
    description:
      'PayPal cancel URL (frontend) the user lands on after cancelling on paypal.com. Only used for PayPal via MCOM Solutions.',
    example: 'https://mall.example.com/pricing?paypal=cancelled',
  })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
