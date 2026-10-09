import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/resources/users/entities/user.entity';
import { AdminAnalyticsService } from '../services/analytics.admin.service';
import { AdminAnalyticsResponseDto } from '../dto/analytics.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiResponse({ status: 200, type: AdminAnalyticsResponseDto })
  getAnalytics(@Query('range') range: string, @CurrentUser() user: User) {
    return this.adminAnalyticsService.getAnalytics(range, {
      id: user.id,
      role: (user as any).role,
    });
  }
}
