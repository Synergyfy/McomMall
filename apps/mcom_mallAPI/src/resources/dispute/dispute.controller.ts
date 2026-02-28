import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import {
  CreateDisputeDto,
  DisputeQueryDto,
  PaginatedDisputesDto,
  DisputeStatsDto,
} from './dto/dispute.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('dispute')
@ApiBearerAuth()
@Controller('dispute')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @ApiOperation({ summary: 'Open a new dispute (Customer/Business)' })
  @ApiResponse({ status: 201, description: 'Dispute opened successfully.' })
  create(
    @Body() createDisputeDto: CreateDisputeDto,
    @CurrentUser() user: User,
  ) {
    return this.disputeService.create(createDisputeDto, user);
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dispute statistics (Admin only)' })
  @ApiResponse({ status: 200, type: DisputeStatsDto })
  getStats() {
    return this.disputeService.getStats();
  }

  @Get('admin/list')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all disputes (Admin only)' })
  @ApiResponse({ status: 200, type: PaginatedDisputesDto })
  findAll(@Query() query: DisputeQueryDto) {
    return this.disputeService.findAll(query);
  }

  @Patch('admin/:id/resolve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve a dispute (Admin only)' })
  resolve(
    @Param('id') id: string,
    @Body('decision') decision: string,
    @Body('notes') notes: string,
    @CurrentUser() admin: User,
  ) {
    return this.disputeService.resolve(id, decision, notes, admin.id);
  }
}
