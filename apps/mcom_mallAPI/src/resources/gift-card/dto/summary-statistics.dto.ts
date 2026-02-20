
import { ApiProperty } from '@nestjs/swagger';
import { GiftCardChartDataDto } from './gift-card-chart-data.dto';

class Summary {
  @ApiProperty({
    description: 'The total number of gift cards.',
    example: 100,
  })
  totalGiftCards: number;

  @ApiProperty({
    description: 'The total liability of gift cards.',
    example: 5000.0,
  })
  totalLiability: number;
}

export class SummaryStatisticsDto {
  @ApiProperty({
    description: 'The summary of gift card statistics.',
  })
  summary: Summary;

  @ApiProperty({
    description: 'The gift card sales vs. redemptions chart data.',
  })
  chartData: GiftCardChartDataDto;
}
