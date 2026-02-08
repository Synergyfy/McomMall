import { ApiProperty } from '@nestjs/swagger';

export class VoucherSummaryStatisticsDto {
  @ApiProperty({
    description: 'The total value of vouchers sold.',
    example: 5000.0,
  })
  totalSold: number;

  @ApiProperty({
    description: 'The total value of vouchers redeemed.',
    example: 2500.0,
  })
  totalRedeemed: number;

  @ApiProperty({
    description: 'The total outstanding liability for unredeemed vouchers.',
    example: 2500.0,
  })
  outstandingLiability: number;
}
