import {
  Controller,
  Get,
  Post,
  Body,
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
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SettingsService } from './settings.service';
import { ToggleAppIntegrationDto } from './dto/toggle-app-integration.dto';
import {
  CreatePaymentMethodDto,
  UpdateIntegrationSettingsDto,
} from './dto/settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('apps')
  @ApiOperation({ summary: 'Get external app integrations for the owner' })
  getAppIntegrations(@CurrentUser() user: User) {
    return this.settingsService.getAppIntegrations(user.id);
  }

  @Post('apps/toggle')
  @ApiOperation({ summary: 'Toggle an external app integration' })
  toggleAppIntegration(
    @CurrentUser() user: User,
    @Body() dto: ToggleAppIntegrationDto,
  ) {
    return this.settingsService.toggleAppIntegration(user.id, dto);
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Get integration toggles for a business' })
  getIntegrations(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.settingsService.getIntegrations(businessId);
  }

  @Put('integrations')
  @ApiOperation({ summary: 'Update integration toggles for a business' })
  updateIntegrations(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: UpdateIntegrationSettingsDto,
  ) {
    return this.settingsService.updateIntegrations(businessId, dto);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'List the current user payment methods' })
  findPaymentMethods(@CurrentUser() user: User) {
    return this.settingsService.findPaymentMethods(user.id);
  }

  @Post('payment-methods')
  @ApiOperation({
    summary: 'Attach a payment method (provider token reference only)',
  })
  createPaymentMethod(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.settingsService.createPaymentMethod(user.id, dto);
  }

  @Put('payment-methods/:id/default')
  @ApiOperation({ summary: 'Set a payment method as default' })
  setDefaultPaymentMethod(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.settingsService.setDefaultPaymentMethod(user.id, id);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Remove a payment method' })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  removePaymentMethod(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.settingsService.removePaymentMethod(user.id, id);
  }

  @Get('billing')
  @ApiOperation({
    summary: 'Get billing summary (plan, payment methods, invoices)',
  })
  @ApiResponse({ status: 200, description: 'Billing summary' })
  getBilling(@CurrentUser() user: User) {
    return this.settingsService.getBilling(user.id);
  }
}
