import { Controller, Get, UseGuards, Query, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminServicesService } from '../services/services.admin.service';
import { ServiceQueryDto, PaginatedServicesDto, ServiceStatsDto } from '../dto/catalog.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/services')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminServicesController {
  constructor(private readonly adminServicesService: AdminServicesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get service statistics' })
  @ApiResponse({ status: 200, type: ServiceStatsDto })
  getStats() {
    return this.adminServicesService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, type: PaginatedServicesDto })
  findAll(@Query() query: ServiceQueryDto) {
    return this.adminServicesService.findAll(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  remove(@Param('id') id: string) {
    return this.adminServicesService.remove(id);
  }
}