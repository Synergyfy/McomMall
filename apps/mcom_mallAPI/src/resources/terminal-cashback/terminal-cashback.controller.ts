import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TerminalCashbackService } from './terminal-cashback.service';
import { CreateTerminalCashbackClaimDto } from './dto/create-claim.dto';
import { UpdateTerminalCashbackStatusDto } from './dto/update-claim.dto';
import { CreateTerminalConfigDto, UpdateTerminalConfigDto } from './dto/config.dto';
import { TerminalCashbackClaim } from './entities/terminal-cashback-claim.entity';
import { TerminalConfig } from './entities/terminal-config.entity';
import { TerminalGlobalRule } from './entities/terminal-global-rule.entity';

@ApiTags('Terminal Cashback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('terminal-cashback')
export class TerminalCashbackController {
  constructor(private readonly service: TerminalCashbackService) {}

  // --- Claims ---

  @Post('claim')
  @ApiOperation({ summary: 'Submit a new terminal cashback claim' })
  @ApiResponse({ status: 201, description: 'Claim submitted successfully', type: TerminalCashbackClaim })
  async createClaim(@CurrentUser() user: any, @Body() dto: CreateTerminalCashbackClaimDto) {
    return this.service.createClaim(user.id, dto);
  }

  @Get('claims')
  @ApiOperation({ summary: 'List claims (Admin/Merchant/User)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'businessId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @ApiResponse({ status: 200, description: 'Paginated list of claims' }) // Note: Pagination wrapper usually requires a specific DTO or Generic, generic 'object' is default here but entities are correct in service
  async getClaims(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('businessId') businessId?: string,
    @Query('status') status?: any,
  ) {
    const query: any = { page, limit, businessId, status };
    if (!user.roles?.includes('ADMIN') && !user.roles?.includes('MERCHANT')) {
       query.userId = user.id;
    }
    return this.service.getClaims(query);
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim details' })
  @ApiResponse({ status: 200, description: 'Claim details', type: TerminalCashbackClaim })
  async getClaim(@Param('id') id: string) {
    return this.service.getClaimById(id);
  }

  @Patch('claims/:id/status')
  @ApiOperation({ summary: 'Approve or Reject a claim (Merchant/Admin)' })
  @ApiResponse({ status: 200, description: 'Status updated', type: TerminalCashbackClaim })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateTerminalCashbackStatusDto) {
    return this.service.updateClaimStatus(id, dto.status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get my cashback stats' })
  @ApiResponse({ status: 200, description: 'User stats', schema: { example: { pendingCount: 2, approvedCount: 15, totalEarned: 45.50 } } })
  async getStats(@CurrentUser() user: any) {
    return this.service.getStats(user.id);
  }

  // --- Configuration (Merchant/Admin) ---

  @Post('config')
  @ApiOperation({ summary: 'Onboard a new merchant terminal (Admin)' })
  @ApiResponse({ status: 201, description: 'Configuration created', type: TerminalConfig })
  async createConfig(@Body() dto: CreateTerminalConfigDto) {
      return this.service.createConfig(dto);
  }

  @Get('config')
  @ApiOperation({ summary: 'List all terminal configs (Admin)' })
  @ApiResponse({ status: 200, description: 'List of configs' })
  async getAllConfigs(@Query('page') page = 1, @Query('limit') limit = 10) {
      return this.service.getAllConfigs(page, limit);
  }

  @Get('config/:businessId')
  @ApiOperation({ summary: 'Get terminal config (Merchant/Public for Ranges)' })
  @ApiResponse({ status: 200, description: 'Terminal configuration', type: TerminalConfig })
  async getConfig(@Param('businessId') businessId: string) {
      return this.service.getConfig(businessId);
  }

  @Patch('config/:businessId')
  @ApiOperation({ summary: 'Update terminal config (Admin/Merchant)' })
  @ApiResponse({ status: 200, description: 'Configuration updated', type: TerminalConfig })
  async updateConfig(@Param('businessId') businessId: string, @Body() dto: UpdateTerminalConfigDto) {
      return this.service.updateConfig(businessId, dto);
  }

  // --- Global Rules (Admin) ---

  @Get('global-rules')
  @ApiOperation({ summary: 'Get global fraud/escalation rules (Admin)' })
  @ApiResponse({ status: 200, description: 'List of rules', type: [TerminalGlobalRule] })
  async getRules() {
      return this.service.getGlobalRules();
  }

  @Put('global-rules/:key')
  @ApiOperation({ summary: 'Update a global rule (Admin)' })
  @ApiResponse({ status: 200, description: 'Rule updated', type: TerminalGlobalRule })
  async updateRule(@Param('key') key: string, @Body('value') value: string) {
      return this.service.updateGlobalRule(key, value);
  }
}
