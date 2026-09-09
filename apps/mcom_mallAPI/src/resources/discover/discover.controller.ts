import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DiscoverService } from './discover.service';
import { DiscoverQueryDto, EventsQueryDto, RewardsQueryDto } from './dto/discover-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Discover')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('home')
  @ApiOperation({ summary: 'Get Discover home feed data (businesses, promotions, events, rewards)' })
  async getHomeFeed(
    @CurrentUser() user: User,
    @Query() query: DiscoverQueryDto,
  ) {
    return this.discoverService.getHomeFeed(user?.id, query);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('businesses')
  @ApiOperation({ summary: 'Get businesses for Discover nearby/trending' })
  async getBusinesses(
    @CurrentUser() user: User,
    @Query() query: DiscoverQueryDto,
  ) {
    return this.discoverService.getBusinesses(user?.id, query);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('events')
  @ApiOperation({ summary: 'Get events for Discover' })
  async getEvents(
    @CurrentUser() user: User,
    @Query() query: EventsQueryDto,
  ) {
    return this.discoverService.getEvents(user?.id, query);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('promotions')
  @ApiOperation({ summary: 'Get promotions for Discover' })
  async getPromotions(
    @CurrentUser() user: User,
    @Query() query: DiscoverQueryDto,
  ) {
    return this.discoverService.getPromotions(user?.id, query);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('rewards')
  @ApiOperation({ summary: 'Get rewards for Discover' })
  async getRewards(
    @CurrentUser() user: User,
    @Query() query: RewardsQueryDto,
  ) {
    return this.discoverService.getRewards(user?.id, query);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('borough-campaigns')
  @ApiOperation({ summary: 'Get borough campaigns' })
  async getBoroughCampaigns(
    @CurrentUser() user: User,
    @Query('borough') borough?: string,
  ) {
    return this.discoverService.getBoroughCampaigns(user?.id, borough);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('high-street')
  @ApiOperation({ summary: 'Get high street data' })
  async getHighStreet(
    @CurrentUser() user: User,
    @Query('borough') borough?: string,
  ) {
    return this.discoverService.getHighStreet(user?.id, borough);
  }
}