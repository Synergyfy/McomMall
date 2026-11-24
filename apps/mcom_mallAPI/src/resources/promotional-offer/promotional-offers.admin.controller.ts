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
import { PromotionalOffersAdminService } from './promotional-offers.admin.service';
import { CreatePromotionalOfferDto } from './dto/create-promotional-offer.dto';
import { UpdatePromotionalOfferDto } from './dto/update-promotional-offer.dto';
import {
  PromotionalOfferQueryDto,
  SyncAwinTransactionsDto,
} from './dto/promotional-offer-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/promotional-offers')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class PromotionalOffersAdminController {
  constructor(
    private readonly adminService: PromotionalOffersAdminService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get promotional offer statistics' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'List promotional offers' })
  findAll(@Query() query: PromotionalOfferQueryDto) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotional offer' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a promotional offer' })
  create(
    @Body() dto: CreatePromotionalOfferDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.create(dto, user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a promotional offer' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionalOfferDto) {
    return this.adminService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a promotional offer' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  @Post('affiliate/sync')
  @ApiOperation({ summary: 'Synchronise transactions from Awin' })
  sync(@Body() dto: SyncAwinTransactionsDto) {
    return this.adminService.syncAwin(dto.startDate, dto.endDate);
  }
}
