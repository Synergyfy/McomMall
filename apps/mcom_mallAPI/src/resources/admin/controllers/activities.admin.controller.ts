import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminActivitiesService } from '../services/activities.admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/activities')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminActivitiesController {
  constructor(private readonly adminActivitiesService: AdminActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  @ApiResponse({ status: 200, description: 'Return all activities.' })
  findAll() {
    return this.adminActivitiesService.findAll();
  }
}