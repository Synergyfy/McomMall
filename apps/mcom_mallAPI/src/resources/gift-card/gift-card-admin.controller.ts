import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ToggleFeatureDto } from './dto/toggle-feature.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { GiftCard } from './entities/gift-card.entity';

@ApiTags('Gift Cards (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/gift-cards')
export class GiftCardAdminController {
  constructor(private readonly giftCardService: GiftCardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide gift card statistics' })
  getPlatformStats() {
    return this.giftCardService.getPlatformStats();
  }

  @Get('lookup/:code')
  @ApiOperation({ summary: 'Find any gift card by its code' })
  findCardByCode(@Param('code') code: string) {
    return this.giftCardService.findGiftCardByCodeAsAdmin(code);
  }

  @Post('toggle-feature')
  @ApiOperation({
    summary: 'Enable or disable the gift card feature for a business owner',
  })
  toggleFeature(@Body() toggleDto: ToggleFeatureDto) {
    return this.giftCardService.toggleGiftCardFeatureForOwner(
      toggleDto.ownerId,
      toggleDto.isEnabled,
    );
  }

  @Get('for-owner/:ownerId')
  @ApiOperation({ summary: "List all gift cards for a specific owner" })
  @ApiOkResponse({
    description: 'A paginated list of gift cards for a specific owner.',
    type: PageDto,
  })
  findAllForOwner(
    @Param('ownerId') ownerId: string,
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query('search') search?: string,
  ): Promise<PageDto<GiftCard>> {
    return this.giftCardService.findAllGiftCardsForOwner(
      ownerId,
      paginationQueryDto,
      search,
    );
  }
}