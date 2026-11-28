import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/role.enum';
import { User } from '../users/entities/user.entity';
import { RecordTakeadsBusinessClickDto } from './dto/takeads-offer.dto';
import { PublicTakeadsOfferQueryDto } from './dto/takeads-query.dto';
import { TakeadsPublicService } from './takeads-public.service';

@ApiTags('TakeAds')
@Controller('takeads')
export class TakeadsPublicController {
  constructor(private readonly publicService: TakeadsPublicService) {}

  @Public()
  @Get('offers')
  @ApiOperation({ summary: 'List approved and published TakeAds offers' })
  offers(@Query() query: PublicTakeadsOfferQueryDto) {
    return this.publicService.listOffers(query);
  }

  @Public()
  @Get('deals')
  @ApiOperation({ summary: 'List approved and published TakeAds deals/coupons' })
  deals(@Query() query: PublicTakeadsOfferQueryDto) {
    return this.publicService.listDeals(query);
  }

  /** Authenticated, plan-variant-scoped feed for the business dashboard. */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get('business/deals')
  @ApiOperation({
    summary: 'List published plan-only TakeAds deals for the current business',
  })
  businessDeals(
    @Query() query: PublicTakeadsOfferQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.publicService.listBusinessDeals(query, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get('business/deals/:id')
  @ApiOperation({
    summary: 'Get a published plan-only TakeAds deal for the current business',
  })
  businessDeal(@Param('id') id: string, @CurrentUser() user: User) {
    return this.publicService.getBusinessOffer(id, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post('business/deals/:id/click')
  @ApiOperation({
    summary: 'Record an authenticated business click and return the tracked URL',
  })
  async businessClick(
    @Param('id') id: string,
    @Body() body: RecordTakeadsBusinessClickDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.publicService.recordBusinessClick(id, {
      source: body.source || 'business-dashboard',
      placement: body.placement || 'affiliate-deals',
      referrer: req.get('referer') || undefined,
      userAgent: req.get('user-agent') || undefined,
      ip: req.ip,
    }, user);

    return { url: result.url };
  }

  @Public()
  @Get('offers/:id')
  @ApiOperation({ summary: 'Get a published TakeAds offer' })
  offer(@Param('id') id: string) {
    return this.publicService.getOffer(id);
  }

  @Public()
  @Get('offers/:id/click')
  @ApiOperation({
    summary: 'Record an outbound click and redirect to the TakeAds link',
  })
  async click(
    @Param('id') id: string,
    @Query('source') source: string | undefined,
    @Query('placement') placement: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.publicService.recordClick(id, {
      source: source || 'marketplace',
      placement,
      referrer: req.get('referer') || undefined,
      userAgent: req.get('user-agent') || undefined,
      ip: req.ip,
    });

    return res.redirect(302, result.url);
  }
}
