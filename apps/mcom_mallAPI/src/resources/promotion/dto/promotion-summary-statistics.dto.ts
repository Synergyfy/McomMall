import { ApiProperty } from '@nestjs/swagger';

export class PromotionSummaryStatisticsDto {
  @ApiProperty({
    description: 'The total points earned through this promotion.',
    example: 1000,
  })
  totalPointsEarned: number;

  @ApiProperty({
    description: 'The total points redeemed using this promotion.',
    example: 500,
  })
  totalPointsRedeemed: number;

  @ApiProperty({
    description: 'The number of unique customers who have participated.',
    example: 50,
  })
  totalParticipants: number;
}
