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
import { AdminTransactionsService } from '../services/transactions.admin.service';
import {
  TransactionQueryDto,
  PaginatedTransactionsDto,
  TransactionStatsDto,
} from '../dto/transactions.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/transactions')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTransactionsController {
  constructor(
    private readonly adminTransactionsService: AdminTransactionsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, type: TransactionStatsDto })
  getStats() {
    return this.adminTransactionsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, type: PaginatedTransactionsDto })
  findAll(@Query() query: TransactionQueryDto) {
    return this.adminTransactionsService.findAll(query);
  }
}
