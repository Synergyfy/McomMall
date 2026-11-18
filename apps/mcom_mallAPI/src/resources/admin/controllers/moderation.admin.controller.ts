import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { CatalogModerationService } from '../services/moderation.admin.service';
import { ModerationQueryDto, ReviewModerationDto } from '../dto/moderation.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/moderation')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminModerationController {
  constructor(private readonly moderationService: CatalogModerationService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Approval and delisting counts by catalog resource',
  })
  getStats() {
    return this.moderationService.getStats();
  }

  @Get(':resource')
  @ApiOperation({
    summary: 'List items awaiting or having completed moderation',
    description:
      'resource: products | services | gift-card-templates | voucher-products | coupon-products | coupons | offers | time-bonuses',
  })
  findAll(
    @Param('resource') resource: string,
    @Query() query: ModerationQueryDto,
  ) {
    return this.moderationService.findAll(resource, query);
  }

  @Patch(':resource/:id/approve')
  @ApiOperation({ summary: 'Approve a pending item so it becomes public' })
  approve(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewModerationDto,
  ) {
    return this.moderationService.approve(resource, id, user.id, dto);
  }

  @Patch(':resource/:id/reject')
  @ApiOperation({ summary: 'Reject an item and keep it hidden from shoppers' })
  reject(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewModerationDto,
  ) {
    return this.moderationService.reject(resource, id, user.id, dto);
  }

  @Patch(':resource/:id/delist')
  @ApiOperation({ summary: 'Delist an item so nobody can see or buy it' })
  delist(@Param('resource') resource: string, @Param('id') id: string) {
    return this.moderationService.delist(resource, id);
  }

  @Patch(':resource/:id/republish')
  @ApiOperation({
    summary: 'Republish a delisted item (approval state is left unchanged)',
  })
  republish(@Param('resource') resource: string, @Param('id') id: string) {
    return this.moderationService.republish(resource, id);
  }
}
