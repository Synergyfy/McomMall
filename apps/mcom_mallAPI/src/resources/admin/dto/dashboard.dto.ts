import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 23, description: 'Number of pending listings' })
  pendingListings: number;

  @ApiProperty({ example: 156, description: 'Number of new signups in the last 24 hours' })
  newSignups24h: number;

  @ApiProperty({ example: 1247, description: 'Number of transactions today' })
  transactionsToday: number;

  @ApiProperty({ example: 45892.50, description: 'Total revenue today' })
  revenueToday: number;

  @ApiProperty({ example: 12453, description: 'Number of active users' })
  activeUsers: number;

  @ApiProperty({ example: 3421, description: 'Total number of businesses' })
  totalBusinesses: number;
}

export class ChartDataPointDto {
  @ApiProperty({ example: '2026-01-11', description: 'Date string (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 125, description: 'Value for the metric' })
  value: number;
}

export class AnalyticsDataDto {
  @ApiProperty({ type: [ChartDataPointDto], description: 'Daily signups for the last 7 days' })
  signups: ChartDataPointDto[];

  @ApiProperty({ type: [ChartDataPointDto], description: 'Daily revenue for the last 7 days' })
  revenue: ChartDataPointDto[];

  @ApiProperty({ example: 1023, description: 'Total signups this week' })
  weeklySignups: number;

  @ApiProperty({ example: 312456.90, description: 'Total revenue this week' })
  weeklyRevenue: number;
}

export class ActivityItemDto {
  @ApiProperty({ example: 'user', description: 'Type of activity (user, order, business)' })
  type: string;

  @ApiProperty({ example: 'New user joined: John Doe', description: 'Description of the activity' })
  message: string;

  @ApiProperty({ example: '2026-01-11T10:00:00Z', description: 'Timestamp of the activity' })
  timestamp: Date;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;

  @ApiProperty({ type: AnalyticsDataDto })
  analytics: AnalyticsDataDto;

  @ApiProperty({ type: [ActivityItemDto] })
  recentActivity: ActivityItemDto[];
}
