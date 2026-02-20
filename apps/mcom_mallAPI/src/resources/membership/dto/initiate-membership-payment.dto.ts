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
}
