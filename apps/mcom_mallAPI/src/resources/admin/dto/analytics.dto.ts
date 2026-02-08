import { ApiProperty } from '@nestjs/swagger';

export class MetricDto {
  @ApiProperty({ example: '12,453' })
  value: string;

  @ApiProperty({ example: '+12.5%' })
  change: string;

  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  changeType: 'up' | 'down';
}

export class AnalyticsChartPointDto {
  @ApiProperty({ example: 'Mon' })
  day: string;

  @ApiProperty({ example: 1200 })
  value: number;
}

export class TopItemDto {
  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: '$45,230' })
  value: string;

  @ApiProperty({ example: '+12%' })
  change: string;
}

export class FunnelItemDto {
  @ApiProperty({ example: 'Page Views' })
  stage: string;

  @ApiProperty({ example: 125430 })
  value: number;

  @ApiProperty({ example: 100 })
  pct: number;
}

export class AdminAnalyticsResponseDto {
  @ApiProperty()
  visitors: MetricDto;

  @ApiProperty()
  signups: MetricDto;

  @ApiProperty()
  revenue: MetricDto;

  @ApiProperty()
  conversionRate: MetricDto;

  @ApiProperty({ type: [AnalyticsChartPointDto] })
  visitorChart: AnalyticsChartPointDto[];

  @ApiProperty({ type: [AnalyticsChartPointDto] })
  revenueChart: AnalyticsChartPointDto[];

  @ApiProperty({ type: [TopItemDto] })
  topCategories: TopItemDto[];

  @ApiProperty({ type: [TopItemDto] })
  topBusinesses: TopItemDto[];

  @ApiProperty({ type: [FunnelItemDto] })
  conversionFunnel: FunnelItemDto[];
}
