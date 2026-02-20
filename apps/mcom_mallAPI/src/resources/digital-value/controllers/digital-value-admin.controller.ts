import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DigitalValueService } from '../digital-value.service';
import { CreateDigitalValueDto } from '../dto/create-digital-value.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/role.enum';

@ApiTags('Digital Value - Admin')
@ApiBearerAuth()
@Controller('digital-value/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class DigitalValueAdminController {
  constructor(private readonly digitalValueService: DigitalValueService) {}

  @Get()
  @ApiOperation({ summary: 'Get all digital value instruments', description: 'Retrieves all instruments across the platform for auditing.' })
  @ApiResponse({ status: 200, description: 'List of all instruments.' })
  getAll() {
    return this.digitalValueService.getAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new digital value instrument', description: 'Admin endpoint to issue new gift cards or vouchers directly (e.g., for customer support or manual rewards).' })
  @ApiResponse({ status: 201, description: 'Instrument created successfully.' })
  create(@Body() createDto: CreateDigitalValueDto, @Req() req) {
    return this.digitalValueService.create(createDto, req.user.id);
  }
}
