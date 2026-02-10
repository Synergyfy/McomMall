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
import { UserRole } from '../../common/role.enum';

@ApiTags('Terminal Cashback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('terminal-cashback')
export class TerminalCashbackController {
  constructor(private readonly service: TerminalCashbackService) { }

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
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @ApiResponse({ status: 200, description: 'Paginated list of claims' }) // Note: Pagination wrapper usually requires a specific DTO or Generic, generic 'object' is default here but entities are correct in service
  async getClaims(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: any,
  ) {
    const query: any = { page, limit, ownerId, status };

    // Robust Role Check
    if (user.role === UserRole.OWNER) {
      // Owners only see claims they own (received)
      query.ownerId = user.id;
    } else if (user.role !== UserRole.ADMIN) {
      // Customers (not Admin, not Owner) only see claims they created
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
    if (user.role === UserRole.OWNER) {
      return this.service.getStats({ ownerId: user.id });
    }
    return this.service.getStats({ userId: user.id });
  }

  // --- Configuration (Merchant/Admin) ---

  @Post('config')
  @ApiOperation({ summary: 'Onboard a new merchant terminal (Admin)' })
  @ApiResponse({ status: 201, description: 'Configuration created', type: TerminalConfig })
  async createConfig(@Body() dto: CreateTerminalConfigDto) {
    console.log('Creating terminal config with DTO:', JSON.stringify(dto));
    return this.service.createConfig(dto);
  }

  @Get('config')
  @ApiOperation({ summary: 'List all terminal configs (Admin)' })
  @ApiResponse({ status: 200, description: 'List of configs' })
  async getAllConfigs(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.getAllConfigs(page, limit);
  }

  @Get('config/:userId')
  @ApiOperation({ summary: 'Get terminal config (Merchant/Public for Ranges)' })
  @ApiResponse({ status: 200, description: 'Terminal configuration', type: TerminalConfig })
  async getConfig(@Param('userId') userId: string) {
    return this.service.getConfig(userId);
  }

  @Patch('config/:userId')
  @ApiOperation({ summary: 'Update terminal config (Admin/Merchant)' })
  @ApiResponse({ status: 200, description: 'Configuration updated', type: TerminalConfig })
  async updateConfig(@Param('userId') userId: string, @Body() dto: UpdateTerminalConfigDto) {
    return this.service.updateConfig(userId, dto);
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
