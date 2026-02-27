import { ApiProperty } from '@nestjs/swagger';

class CouponMonthlyData {
  @ApiProperty({ description: 'The month (e.g., "2023-01").' })
  month: string;

  @ApiProperty({ description: 'The total amount sold in this month.' })
  sales: number;

  @ApiProperty({ description: 'The total amount redeemed in this month.' })
  redemptions: number;
}

export class CouponChartDataDto {
  @ApiProperty({ type: [CouponMonthlyData] })
  data: CouponMonthlyData[];
}
