import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { MembershipTier } from '../membership-tier.enum';
import { PlanType } from './initiate-membership-payment.dto';

class MembershipPurchaseDetailsDto {
  @ApiPropertyOptional({
    description: 'The tier enum of the membership being purchased (legacy).',
    enum: MembershipTier,
    example: MembershipTier.PROFESSIONAL,
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
  })
  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType = PlanType.MONTHLY;
}

export class VerifyMembershipPaymentDto {
  @ApiProperty({
    description: 'The payment provider that was used.',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentProvider: PaymentMethod;

  @ApiProperty({
    description:
      'The payment identifier from the provider (e.g., Stripe PaymentIntent ID, PayPal Order ID).',
    example: 'pi_1J2j3k4L5m6n7o8p9q0r',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The original details of the membership purchase initiation.',
  })
  @ValidateNested()
  @Type(() => MembershipPurchaseDetailsDto)
  purchaseDetails: MembershipPurchaseDetailsDto;
}