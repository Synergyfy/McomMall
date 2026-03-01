import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminAnalyticsService } from '../services/analytics.admin.service';
import { AdminAnalyticsResponseDto } from '../dto/analytics.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiResponse({ status: 200, type: AdminAnalyticsResponseDto })
  getAnalytics(@Query('range') range: string) {
    return this.adminAnalyticsService.getAnalytics(range);
  }
}
