import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { PromotionalOffersAdminService } from './promotional-offers.admin.service';
import { AffiliateReportQueryDto } from './dto/promotional-offer-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/affiliate')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AffiliateAdminController {
  constructor(
    private readonly adminService: PromotionalOffersAdminService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get platform affiliate performance summary' })
  summary() {
    return this.adminService.getAffiliateSummary();
  }

  @Get('clicks')
  @ApiOperation({ summary: 'List affiliate clicks across all businesses' })
  clicks(@Query() query: AffiliateReportQueryDto) {
    return this.adminService.listClicks(query);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'List Awin transactions across all businesses',
  })
  transactions(@Query() query: AffiliateReportQueryDto) {
    return this.adminService.listTransactions(query);
  }
}
