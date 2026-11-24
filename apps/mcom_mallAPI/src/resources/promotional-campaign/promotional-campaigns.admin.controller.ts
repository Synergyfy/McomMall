import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PromotionalCampaignsService } from './promotional-campaigns.service';
import {
  CreatePromotionalCampaignDto,
  PromotionalCampaignQueryDto,
  UpdatePromotionalCampaignDto,
} from './dto/promotional-campaign.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/promotional-campaigns')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class PromotionalCampaignsAdminController {
  constructor(
    private readonly campaignsService: PromotionalCampaignsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get promotional campaign statistics' })
  getStats() {
    return this.campaignsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'List promotional campaigns' })
  findAll(@Query() query: PromotionalCampaignQueryDto) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotional campaign' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a promotional campaign' })
  create(
    @Body() dto: CreatePromotionalCampaignDto,
    @CurrentUser() user: User,
  ) {
    return this.campaignsService.create(dto, user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a promotional campaign' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionalCampaignDto,
  ) {
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a promotional campaign' })
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}
