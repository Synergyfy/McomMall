import { ApiProperty } from '@nestjs/swagger';

export class GiftCardStatsDto {
  @ApiProperty({
    description: 'The total value of all gift cards sold.',
    example: 5000.0,
  })
  totalSold: number;

  @ApiProperty({
    description: 'The total value of all gift cards redeemed.',
    example: 2500.0,
  })
  totalRedeemed: number;

  @ApiProperty({
    description: 'The total outstanding liability on all active gift cards.',
    example: 2500.0,
  })
  outstandingLiability: number;

  @ApiProperty({
    description: 'The total number of active gift cards.',
    example: 100,
  })
  activeCards: number;
}