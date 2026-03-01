import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CentralIntegrationService } from '../services/central-integration.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  CreateCashbackRuleDto,
  UpdateCashbackRuleDto,
  CashbackRuleResponseDto,
} from '../dto/create-cashback-rule.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Cashback')
@Controller('cashback')
@ApiBearerAuth()
export class CashbackController {
  constructor(private readonly centralService: CentralIntegrationService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current cashback balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current cashback balance.',
  })
  async getBalance(@CurrentUser() user) {
    return {
      balance: await this.centralService.getCashbackBalance(user.email),
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get my cashback history' })
  @ApiResponse({ status: 200, description: 'Returns paginated history.' })
  async getMyHistory(
    @CurrentUser() user,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = 'DESC',
  ) {
    return this.centralService.getHistory({
      email: user.email,
      page,
      limit,
      sort,
    });
  }

  @Get('admin/history')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get platform cashback history (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns paginated history.' })
  async getAdminHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('email') email?: string,
    @Query('sort') sort = 'DESC',
  ) {
    return this.centralService.getHistory({
      platform: 'MCOM_MALL',
      page,
      limit,
      email,
      sort,
    });
  }

  @Get('admin/global-history')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get global cashback history (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns paginated history.' })
  async getGlobalHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('email') email?: string,
    @Query('sort') sort = 'DESC',
  ) {
    return this.centralService.getHistory({ page, limit, email, sort });
  }

  @Public()
  @Get('rules')
  @ApiOperation({ summary: 'List platform cashback rules' })
  @ApiResponse({
    status: 200,
    description: 'List of rules.',
    type: [CashbackRuleResponseDto],
  })
  async getRules(): Promise<CashbackRuleResponseDto[]> {
    const rules = await this.centralService.getRules('MCOM_MALL');
    // Filter out adminId from each rule
    return rules.map((rule) => {
      const { adminId, ...publicRule } = rule;
      return publicRule;
    });
  }

  @Post('rules')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a cashback rule (Admin)' })
  @ApiResponse({ status: 201, description: 'Rule created.' })
  async createRule(@Body() body: CreateCashbackRuleDto, @CurrentUser() user) {
    return this.centralService.createCashbackRule(
      body.eventType,
      body.rewardType,
      body.rewardValue,
      user.id,
    );
  }

  @Get('events')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all valid cashback event types' })
  @ApiResponse({ status: 200, description: 'List of event type strings.' })
  async getEvents() {
    return this.centralService.getEvents();
  }

  @Patch('rules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a cashback rule (Admin)' })
  @ApiResponse({ status: 200, description: 'Rule updated.' })
  async updateRule(
    @Param('id') id: string,
    @Body() body: UpdateCashbackRuleDto,
  ) {
    return this.centralService.updateRule(id, body);
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a cashback rule (Admin)' })
  @ApiResponse({ status: 200, description: 'Rule deleted.' })
  async deleteRule(@Param('id') id: string) {
    return this.centralService.deleteRule(id);
  }
}
