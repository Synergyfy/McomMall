import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { LoyaltyService } from './loyalty.service';

@ApiTags('Loyalty')
@Controller('loyalty/public')
export class LoyaltyPublicController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('program/:businessId')
  @ApiOperation({ summary: 'Get a public loyalty programme summary' })
  @ApiParam({ name: 'businessId', description: 'Listing (business) UUID' })
  getProgram(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user?: User,
  ) {
    return this.loyaltyService.getPublicProgram(businessId, user?.id);
  }
}
