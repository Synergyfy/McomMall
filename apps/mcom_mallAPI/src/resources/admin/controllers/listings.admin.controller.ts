import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { AdminListingsService } from '../services/listings.admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/listings')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminListingsController {
  constructor(private readonly adminListingsService: AdminListingsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all listings' })
  @ApiResponse({
    status: 200,
    description: 'Return all listings.',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        businessName: 'Tech Haven',
        status: 'PUBLISHED',
        user: {
          id: 'user-uuid',
          email: 'admin@example.com',
        },
        sector: {
          id: 'sector-uuid',
          name: 'Technology',
        },
      },
      {
        id: '987fcdeb-51a2-4367-9abd-1234567890ab',
        businessName: 'Another Business',
        status: 'DRAFT',
      },
    ],
  })
  findAll() {
    return this.adminListingsService.findAll();
  }
}