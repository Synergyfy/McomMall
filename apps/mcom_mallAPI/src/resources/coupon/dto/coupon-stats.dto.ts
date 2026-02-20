import { ApiProperty } from '@nestjs/swagger';

export class CouponStatsDto {
  @ApiProperty({
    description: 'The total value of all coupons sold.',
    example: 5000.0,
  })
  totalSold: number;

  @ApiProperty({
    description: 'The total value of all coupons redeemed.',
    example: 2500.0,
  })
  totalRedeemed: number;

  @ApiProperty({
    description: 'The total outstanding liability on all active coupons.',
    example: 2500.0,
  })
  outstandingLiability: number;

  @ApiProperty({
    description: 'The total number of active coupons.',
    example: 100,
  })
  activeCoupons: number;
}
