import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PromotionalOffersService } from './promotional-offers.service';
import { PublicPromotionalOfferQueryDto } from './dto/promotional-offer-query.dto';

@ApiTags('Promotional Offers')
@Controller('promotional-offers')
export class PromotionalOffersController {
  constructor(
    private readonly promotionalOffersService: PromotionalOffersService,
  ) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'List live promotional offers' })
  getPublicOffers(@Query() query: PublicPromotionalOfferQueryDto) {
    return this.promotionalOffersService.getPublicOffers(query);
  }

  @Public()
  @Get('public/:id')
  @ApiOperation({ summary: 'Get a live promotional offer' })
  getPublicOffer(@Param('id') id: string) {
    return this.promotionalOffersService.getPublicOffer(id);
  }

  @Public()
  @Get('click/:id')
  @ApiOperation({
    summary:
      'Record an affiliate click and redirect to the advertiser destination',
  })
  async click(
    @Param('id') id: string,
    @Query('businessId') businessId: string | undefined,
    @Query('campaignId') campaignId: string | undefined,
    @Query('source') source: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.promotionalOffersService.recordClick(id, {
      businessId: businessId || undefined,
      campaignId: campaignId || undefined,
      source: source || 'marketplace',
      referrer: req.get('referer') || undefined,
      userAgent: req.get('user-agent') || undefined,
      ip: req.ip,
    });

    return res.redirect(302, result.url);
  }

  @UseGuards(JwtAuthGuard)
  @Get('catalog')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List promotional offers available to the current business',
  })
  getCatalogue(
    @CurrentUser() user: User,
    @Query('offeringType') offeringType?: 'product' | 'service' | 'offer',
  ) {
    return this.promotionalOffersService.getBusinessCatalogue(
      user.id,
      offeringType,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/import')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a promotional offer to my storefront' })
  importOffer(@CurrentUser() user: User, @Param('id') id: string) {
    return this.promotionalOffersService.importOffer(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/import')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a promotional offer from my storefront' })
  removeOffer(@CurrentUser() user: User, @Param('id') id: string) {
    return this.promotionalOffersService.removeImport(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('performance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my affiliate promotion performance' })
  getPerformance(@CurrentUser() user: User) {
    return this.promotionalOffersService.getBusinessPerformance(user.id);
  }
}
