import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { VoucherSummaryStatisticsDto } from './dto/voucher-summary-statistics.dto';
import { VoucherHistoryQueryDto } from './dto/voucher-history-query.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { VoucherTransactionHistoryDto } from './dto/voucher-transaction-history.dto';

@ApiTags('vouchers-admin')
@Controller('admin/vouchers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth()
export class VoucherAdminController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify a voucher by code' })
  async verifyVoucher(@Param('code') code: string) {
    // Provides a simple way for an admin to check the status and details of any voucher
    return this.voucherService.findVoucherByCode(code);
  }

  // This is a placeholder for a more advanced query/reporting endpoint.
  // In a real application, this would have pagination and filtering.
  @Get('all')
  @ApiOperation({ summary: 'Get all vouchers' })
  async getAllVouchers() {
    // For simplicity, this is not implemented in the service,
    // as it would require more complex querying.
    // In a real implementation, you'd call:
    // return this.voucherService.findAllVouchers(queryOptions);
    return { message: 'Endpoint for all vouchers, implementation pending.' };
  }

  @Get('summary-statistics')
  @ApiOperation({ summary: 'Get summary statistics for vouchers' })
  @ApiResponse({
    status: 200,
    description: 'The summary statistics for vouchers.',
    type: VoucherSummaryStatisticsDto,
  })
  getSummaryStatistics(@CurrentUser() user: User) {
    return this.voucherService.getSummaryStatistics(user.id);
  }

  @Get('transaction-history')
  @ApiOperation({ summary: 'Get the transaction history for vouchers' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of voucher transactions.',
    type: PageDto<VoucherTransactionHistoryDto>,
  })
  getTransactionHistory(
    @CurrentUser() user: User,
    @Query() query: VoucherHistoryQueryDto,
  ) {
    return this.voucherService.getTransactionHistory(user.id, query);
  }
}
