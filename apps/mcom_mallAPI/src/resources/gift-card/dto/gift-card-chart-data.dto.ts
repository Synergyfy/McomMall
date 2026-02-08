import { ApiProperty } from '@nestjs/swagger';

class MonthlyData {
  @ApiProperty({ description: 'The month (e.g., "2023-01").' })
  month: string;

  @ApiProperty({ description: 'The total amount sold in this month.' })
  sales: number;

  @ApiProperty({ description: 'The total amount redeemed in this month.' })
  redemptions: number;
}

export class GiftCardChartDataDto {
  @ApiProperty({ type: [MonthlyData] })
  data: MonthlyData[];
}