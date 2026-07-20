import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { SubmitAuditDto } from './dto/submit-audit.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Audit } from './entities/audit.entity';

@ApiTags('Business Audits')
@ApiBearerAuth()
@Controller('business/audits')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Submit questionnaire responses and run storefront audit',
  })
  @ApiResponse({ status: 201, type: Audit })
  async submitAudit(
    @CurrentUser() user: User,
    @Body() dto: SubmitAuditDto,
  ): Promise<Audit> {
    return this.auditsService.submitAudit(user.id, dto);
  }

  @Get('latest')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: 'Retrieve the latest run audit and suggestions list',
  })
  @ApiQuery({ name: 'businessId', required: false, type: String })
  @ApiResponse({ status: 200, type: Audit })
  async getLatestAudit(
    @CurrentUser() user: User,
    @Query('businessId') businessId?: string,
  ): Promise<Audit> {
    return this.auditsService.getLatestAudit(user.id, businessId);
  }

  @Get('history')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Retrieve audit history log for graph plotting' })
  @ApiQuery({ name: 'businessId', required: false, type: String })
  @ApiResponse({ status: 200, type: [Audit] })
  async getAuditHistory(
    @CurrentUser() user: User,
    @Query('businessId') businessId?: string,
  ): Promise<Audit[]> {
    return this.auditsService.getAuditHistory(user.id, businessId);
  }
}
