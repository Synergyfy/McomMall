import {
  Body,
  Controller,
  Get,
  UseGuards,
  Query,
  Delete,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminServicesService } from '../services/services.admin.service';
import {
  ServiceQueryDto,
  PaginatedServicesDto,
  ServiceStatsDto,
} from '../dto/catalog.dto';
import { CreateAdminServiceDto } from '../dto/create-admin-service.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { ReviewModerationDto } from '../dto/moderation.dto';

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

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a pending service' })
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminServicesService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending service' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewModerationDto,
  ) {
    return this.adminServicesService.reject(id, user.id, dto.reviewNote);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Delist a service' })
  deactivate(@Param('id') id: string) {
    return this.adminServicesService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Republish a delisted service' })
  activate(@Param('id') id: string) {
    return this.adminServicesService.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  remove(@Param('id') id: string) {
    return this.adminServicesService.remove(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a service for any business (Admin only)' })
  @ApiCreatedResponse({ description: 'Service created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input payload' })
  @ApiNotFoundResponse({ description: 'Business with specified ID was not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT bearer token' })
  create(@Body() dto: CreateAdminServiceDto) {
    return this.adminServicesService.create(dto);
  }
}
