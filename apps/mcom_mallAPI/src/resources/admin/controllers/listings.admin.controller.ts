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
import { AdminListingsService } from '../services/listings.admin.service';
import { ListingQueryDto, PaginatedListingsDto } from '../dto/listings.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/listings')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminListingsController {
  constructor(private readonly adminListingsService: AdminListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all listings' })
  @ApiResponse({ status: 200, type: PaginatedListingsDto })
  findAll(@Query() query: ListingQueryDto) {
    return this.adminListingsService.findAll(query);
  }
}
