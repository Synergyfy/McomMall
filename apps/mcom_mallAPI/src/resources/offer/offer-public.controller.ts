import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { OfferService } from './offer.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Offers')
@Controller('offer/public')
export class OfferPublicController {
  constructor(private readonly offerService: OfferService) {}

  @Public()
  @Get('business/:businessId')
  @ApiOperation({
    summary: 'List active rewards offered by a business',
    description:
      'Public list of loyalty rewards a customer can redeem with points at checkout.',
  })
  @ApiParam({ name: 'businessId', description: 'Listing (business) UUID' })
  @ApiResponse({ status: 200, description: 'Active offers for the business' })
  findActiveForBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.offerService.findActiveForBusiness(businessId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('time-bonuses/business/:businessId')
  @ApiOperation({
    summary: 'List active time bonuses for a business',
    description:
      'Public list of time bonuses a customer can activate to earn bonus points.',
  })
  findTimeBonuses(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user?: User,
  ) {
    return this.offerService.findPublicTimeBonuses(businessId, user?.id);
  }
}
