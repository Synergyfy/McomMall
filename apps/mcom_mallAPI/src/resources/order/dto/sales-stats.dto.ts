import { ApiProperty } from '@nestjs/swagger';

export class SalesStatsDto {
  @ApiProperty()
  totalSales: number;

  @ApiProperty()
  netSales: number;

  @ApiProperty()
  orders: number;

  @ApiProperty()
  productsSold: number;

  @ApiProperty()
  totalEarnings: number;

  @ApiProperty()
  grossSales: number;

  @ApiProperty()
  balance: number;

  @ApiProperty({
    description:
      'Total MCOM Rewards discount absorbed by this owner’s products (committed redemptions).',
  })
  rewardDiscountTotal: number;
}
