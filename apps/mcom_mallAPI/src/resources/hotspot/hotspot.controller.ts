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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/role.enum';

@ApiTags('Hotspot Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@Controller('hotspots')
export class HotspotController {
  constructor(private readonly hotspotService: HotspotService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hotspot campaign with placements' })
  create(@Body() dto: CreateHotspotCampaignDto, @CurrentUser() user: any) {
    return this.hotspotService.create(dto, user);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing hotspot campaign' })
  duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DuplicateHotspotCampaignDto,
    @CurrentUser() user: any,
  ) {
    return this.hotspotService.duplicate(id, dto.newTitle, user);
  }

  @Get('business/:businessId/analytics')
  @ApiOperation({ summary: 'Get aggregate hotspot analytics for a business' })
  getAnalytics(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.hotspotService.getAnalytics(businessId, user);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'List all hotspot campaigns for a business',
  })
  findAllByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user: any,
  ) {
    return this.hotspotService.findAllByBusiness(businessId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotspot campaign by ID' })
  @ApiParam({ name: 'id', description: 'Hotspot campaign UUID' })
  @ApiResponse({ status: 200, description: 'Hotspot campaign retrieved' })
  @ApiNotFoundResponse({ description: 'Hotspot campaign not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.hotspotService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hotspot campaign and its placements' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotspotCampaignDto,
    @CurrentUser() user: any,
  ) {
    return this.hotspotService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hotspot campaign' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.hotspotService.remove(id, user);
  }
}
