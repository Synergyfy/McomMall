import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminPromotionsService } from '../services/promotions.admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/promotions')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPromotionsController {
  constructor(private readonly adminPromotionsService: AdminPromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiResponse({ status: 200, description: 'Return all promotions.' })
  findAll() {
    return this.adminPromotionsService.findAll();
  }
}