import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { HotspotService } from './hotspot.service';
import { CreateHotspotCampaignDto } from './dto/create-hotspot-campaign.dto';
import { UpdateHotspotCampaignDto } from './dto/update-hotspot-campaign.dto';
import { DuplicateHotspotCampaignDto } from './dto/duplicate-hotspot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Hotspot Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hotspots')
export class HotspotController {
  constructor(private readonly hotspotService: HotspotService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hotspot campaign with placements' })
  create(@Body() dto: CreateHotspotCampaignDto) {
    return this.hotspotService.create(dto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing hotspot campaign' })
  duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DuplicateHotspotCampaignDto,
  ) {
    return this.hotspotService.duplicate(id, dto.newTitle);
  }

  @Get('business/:businessId/analytics')
  @ApiOperation({ summary: 'Get aggregate hotspot analytics for a business' })
  getAnalytics(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.hotspotService.getAnalytics(businessId);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'List all hotspot campaigns for a business',
  })
  findAllByBusiness(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.hotspotService.findAllByBusiness(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotspot campaign by ID' })
  @ApiParam({ name: 'id', description: 'Hotspot campaign UUID' })
  @ApiResponse({ status: 200, description: 'Hotspot campaign retrieved' })
  @ApiNotFoundResponse({ description: 'Hotspot campaign not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotspotService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hotspot campaign and its placements' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotspotCampaignDto,
  ) {
    return this.hotspotService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hotspot campaign' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotspotService.remove(id);
  }
}
