import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from 'src/common/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { McomPayService } from '../services/mcom-pay.service';

/**
 * Read-only MCOM Pay reporting for mall admins.
 *
 * These call the partner endpoints from the MCOM Payments guide (G5/G6) so the
 * mall can answer "did the seller actually get paid?", "what does MCOM owe
 * us?", and "what did we charge this month?" without touching Central Hub.
 */
@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/payments/mcom')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class McomPartnerAdminController {
  constructor(private readonly mcomPayService: McomPayService) {}

  @Get('balance')
  @ApiOperation({
    summary: "Get this app's MCOM Pay payable balance and pending payouts",
  })
  getBalance() {
    return this.mcomPayService.getAppBalance();
  }

  @Get('charges')
  @ApiOperation({ summary: 'List MCOM Pay charges created by this app' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'mcomUserId', required: false })
  @ApiQuery({ name: 'reference', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listCharges(
    @Query('status') status?: string,
    @Query('mcomUserId') mcomUserId?: string,
    @Query('reference') reference?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mcomPayService.listCharges({
      status,
      mcomUserId,
      reference,
      dateFrom,
      dateTo,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('charges/:id/splits')
  @ApiOperation({
    summary: 'Get payee split settlement status for an MCOM Pay charge',
  })
  getChargeSplits(@Param('id') id: string) {
    return this.mcomPayService.getChargeSplits(id);
  }
}
