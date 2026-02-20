import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { MembershipTier } from '../membership-tier.enum';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'The ID of the payment intent from Stripe.',
    example: 'pi_12345',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiProperty({
    description: 'The tier of the membership being purchased.',
    enum: MembershipTier,
  })
  @IsEnum(MembershipTier)
  tier: MembershipTier;
}
