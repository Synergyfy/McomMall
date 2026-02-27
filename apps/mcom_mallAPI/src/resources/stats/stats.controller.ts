import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SalesChartQueryDto } from './dto/sales-chart.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserStats(@CurrentUser() user: User) {
    return this.statsService.getUserStats(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sales-chart')
  getSalesChart(@CurrentUser() user: User, @Query() query: SalesChartQueryDto) {
    return this.statsService.getSalesChart(user, query);
  }
}
