import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MembershipTier } from '../membership-tier.enum';

export class CreateMembershipDto {
  @ApiProperty({
    description: 'The tier of the membership.',
    enum: MembershipTier,
    example: MembershipTier.BASIC,
  })
  @IsEnum(MembershipTier)
  tier: MembershipTier;
}
