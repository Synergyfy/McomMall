import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CampaignCashbackService } from './campaign-cashback.service';
import { CreateCampaignCashbackDto } from './dto/create-campaign-cashback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CampaignTargetType } from './campaign-cashback.enum';
import { ContributeDto } from './dto/contribute.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Campaign Cashback')
@ApiBearerAuth()
@Controller('campaign-cashback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignCashbackController {
  constructor(private readonly service: CampaignCashbackService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new campaign cashback template',
    description:
      'Endpoint for Platform Admins to setup a new 3-tier cashback campaign. Defines values, spending channels, and inheritance (Regular/Seasonal).',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Spring 2026 Promo',
        totalValue: 30,
        levelValue: 10,
        type: 'REGULAR',
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-04-01T23:59:59Z',
      },
    },
  })
  create(@Body() createDto: CreateCampaignCashbackDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all eligible campaign cards for the current user',
    description:
      "Returns all campaign cards available to the logged-in user. If a campaign is seen for the first time, it automatically initializes the user's multi-bucket wallet instances.",
  })
  @ApiQuery({
    name: 'targetType',
    enum: CampaignTargetType,
    required: false,
    description: 'Filter by B2B (BUSINESS) or B2C (CONSUMERS)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user campaign instances with current balances',
    schema: {
      example: [
        {
          id: 'user-campaign-uuid',
          status: 'ACTIVE',
          contributionPaid: false,
          campaign: { name: 'Spring 2026 Promo', totalValue: 30 },
          wallets: [
            {
              channelType: 'ONLINE',
              value1Balance: 10,
              value2Balance: 0,
              value3Balance: 0,
            },
            {
              channelType: 'HYPERLOCAL',
              value1Balance: 0,
              value2Balance: 10,
              value3Balance: 0,
            },
          ],
        },
      ],
    },
  })
  findAll(
    @CurrentUser() user: User,
    @Query('targetType') targetType?: CampaignTargetType,
  ) {
    return this.service.findAllForUser(user, targetType);
  }

  @Get('templates/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all campaign templates (Admin Only)',
    description:
      'Returns a paginated list of all campaign templates in the system, including those not yet started or already expired.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of all campaign templates',
  })
  findAllTemplates(@Query() pagination: PaginationQueryDto) {
    return this.service.findAllTemplates(pagination);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get detailed status of a specific campaign card',
    description:
      'Retrieve the configuration, balances, and contribution status of a single campaign card.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the User Campaign instance',
  })
  @ApiResponse({ status: 200, description: 'Detailed user campaign object' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOne(id, user);
  }

  @Post(':id/contribute')
  @ApiOperation({
    summary: 'Process user contribution to unlock full card value',
    description:
      'Allows a user to pay their 1/3 share (£10 in a £30 model) using Wallet, Stripe, or PayPal. Includes idempotency checks to prevent duplicate charges.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the User Campaign instance',
  })
  @ApiResponse({
    status: 201,
    description: 'Contribution successful, card unlocked',
    schema: {
      example: {
        id: 'user-campaign-uuid',
        contributionPaid: true,
        status: 'ACTIVE',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient funds or duplicate transaction ID',
  })
  contribute(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() contributeDto: ContributeDto,
  ) {
    return this.service.contribute(id, user, contributeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a campaign template',
    description:
      'Admin-only endpoint to remove a campaign template from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the Campaign Cashback template',
  })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
