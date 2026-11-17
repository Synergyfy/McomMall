import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';

export class RedeemRewardDto {
  @ApiProperty({
    description: 'UUID of the reward to redeem with points',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}

export class RedeemCodeDto {
  @ApiProperty({
    description: 'Reward code to redeem for bonus points',
    example: 'MCOM2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RsvpEventDto {
  @ApiProperty({
    description: 'UUID of the event to RSVP for',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export class UpdateChallengeProgressDto {
  @ApiProperty({ example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  progress: number;
}
