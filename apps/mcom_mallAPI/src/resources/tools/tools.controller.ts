import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ToolsService } from './tools.service';
import { CreateClearancePromotionDto } from './dto/create-clearance-promotion.dto';
import { PublishCapacitySlotDto } from './dto/publish-capacity-slot.dto';

@ApiTags('Business Tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get business tools dashboard summary metrics',
  })
  @ApiResponse({ status: 200, description: 'Tools dashboard metrics' })
  getDashboard(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.toolsService.getDashboard(businessId);
  }

  @Get('excess-stock')
  @ApiOperation({ summary: 'List products below their low-stock threshold' })
  getExcessStock(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.toolsService.getExcessStock(businessId);
  }

  @Post('excess-stock/clearance')
  @ApiOperation({
    summary: 'Create clearance sale from excess low-stock inventory',
  })
  createClearancePromotion(@Body() dto: CreateClearancePromotionDto) {
    return this.toolsService.createClearancePromotion(dto);
  }

  @Get('capacity')
  @ApiOperation({ summary: 'Get service capacity utilisation for a business' })
  getCapacity(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.toolsService.getCapacity(businessId);
  }

  @Post('capacity/slots')
  @ApiOperation({ summary: 'Publish off-peak capacity discount slot' })
  publishCapacitySlot(@Body() dto: PublishCapacitySlotDto) {
    return this.toolsService.publishCapacitySlot(dto);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get operational alerts for a business' })
  getAlerts(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.toolsService.getAlerts(businessId, limit);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get active campaigns and rotators for a business' })
  getCampaigns(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.toolsService.getCampaigns(businessId);
  }
}
