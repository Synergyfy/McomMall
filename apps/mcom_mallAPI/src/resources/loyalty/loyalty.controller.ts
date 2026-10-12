import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/role.enum';
import { LoyaltyService } from './loyalty.service';
import {
  CreateLoyaltyRuleDto,
  UpdateLoyaltyRuleDto,
  UpdateLoyaltySettingsDto,
} from './dto/loyalty.dto';
import { AllocatePointsDto } from './dto/allocate-points.dto';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('points/allocate')
  @ApiOperation({ summary: 'Manually allocate loyalty points to a customer' })
  allocatePoints(@Body() dto: AllocatePointsDto, @CurrentUser() user: any) {
    return this.loyaltyService.allocatePoints(dto, user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get loyalty program stats for a business' })
  async getStats(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.getStats(businessId, user);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get loyalty overview for a customer' })
  @ApiParam({ name: 'customerId', description: 'Customer (user) UUID' })
  @ApiResponse({ status: 200, description: 'Customer loyalty data' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  async getCustomerLoyalty(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.getCustomerLoyalty(businessId, customerId, user);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List loyalty rules for a business' })
  findAllRules(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.findAllRules(businessId, user);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create a loyalty rule' })
  createRule(@Body() dto: CreateLoyaltyRuleDto, @CurrentUser() user: any) {
    return this.loyaltyService.createRule(dto, user);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update a loyalty rule' })
  updateRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLoyaltyRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.updateRule(id, dto, user);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete a loyalty rule' })
  removeRule(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.loyaltyService.removeRule(id, user);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get loyalty settings for a business' })
  getSettings(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.getSettings(businessId, user);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update loyalty settings for a business' })
  updateSettings(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: UpdateLoyaltySettingsDto,
    @CurrentUser() user: any,
  ) {
    return this.loyaltyService.updateSettings(businessId, dto, user);
  }
}
