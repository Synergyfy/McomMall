import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PromotionalCampaignsService } from './promotional-campaigns.service';
import { RespondToCampaignDto } from './dto/promotional-campaign.dto';

@ApiTags('Promotional Campaigns')
@Controller('promotional-campaigns')
export class PromotionalCampaignsController {
  constructor(
    private readonly campaignsService: PromotionalCampaignsService,
  ) {}

  @Public()
  @Get('public/:businessId')
  @ApiOperation({
    summary: 'Get campaigns accepted by a business for its storefront',
  })
  getPublic(@Param('businessId') businessId: string) {
    return this.campaignsService.getPublicForBusiness(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get campaigns available to the current business',
  })
  getMine(@CurrentUser() user: User) {
    return this.campaignsService.getForBusiness(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/respond')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept, decline or withdraw from a campaign' })
  respond(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RespondToCampaignDto,
  ) {
    return this.campaignsService.respond(user.id, id, dto);
  }
}
