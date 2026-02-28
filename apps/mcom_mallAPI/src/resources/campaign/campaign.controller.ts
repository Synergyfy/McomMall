import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateMarketingCampaignDto,
  UpdateMarketingCampaignDto,
} from './dto/marketing-campaign.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // --- Ad Campaigns (Legacy/Existing) ---

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new Ad Campaign',
    description: 'Requires authentication.',
  })
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all Ad Campaigns',
    description: 'Public endpoint.',
  })
  findAll() {
    return this.campaignService.findAll();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user Ad Campaigns',
    description: 'Requires authentication.',
  })
  findMine(@Req() req) {
    return this.campaignService.findMine(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific Ad Campaign',
    description: 'Public endpoint.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an Ad Campaign',
    description: 'Requires authentication.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete an Ad Campaign',
    description: 'Requires authentication.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.remove(id);
  }

  // --- Marketing Campaigns (New - Platform Controlled) ---

  @Post('marketing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new Marketing Campaign (Admin Only)',
    description: 'Platform-controlled campaign for coupons.',
  })
  createMarketing(@Body() dto: CreateMarketingCampaignDto) {
    return this.campaignService.createMarketingCampaign(dto);
  }

  @Get('marketing/list')
  @ApiOperation({
    summary: 'List all Marketing Campaigns (Paginated)',
    description: 'Public endpoint.',
  })
  findAllMarketing(@Query() pagination: PaginationQueryDto) {
    return this.campaignService.findAllMarketingCampaigns(pagination);
  }

  @Get('marketing/:id')
  @ApiOperation({
    summary: 'Get a specific Marketing Campaign',
    description: 'Public endpoint.',
  })
  findOneMarketing(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.findOneMarketingCampaign(id);
  }

  @Patch('marketing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a Marketing Campaign (Admin Only)',
    description: 'Requires admin role.',
  })
  updateMarketing(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMarketingCampaignDto,
  ) {
    return this.campaignService.updateMarketingCampaign(id, dto);
  }

  @Delete('marketing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a Marketing Campaign (Admin Only)',
    description: 'Requires admin role.',
  })
  removeMarketing(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.removeMarketingCampaign(id);
  }
}
