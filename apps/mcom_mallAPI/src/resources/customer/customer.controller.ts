import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';
import {
  RedeemRewardDto,
  RedeemCodeDto,
  RsvpEventDto,
  ListCustomerPromotionsQueryDto,
  UpdateChallengeProgressDto,
} from './dto/customer.dto';
import {
  CustomerHomeResponseDto,
  PromotionItemResponseDto,
  CustomerRewardsResponseDto,
  RedeemRewardResponseDto,
  RedeemCodeResponseDto,
  CustomerEventsResponseDto,
  RsvpEventResponseDto,
  GamifyStatusResponseDto,
  SpinResultDto,
  ScratchResultDto,
  ChallengeResponseDto,
  UpdateChallengeProgressResponseDto,
  DiscoverResponseDto,
  CustomerBusinessProfileResponseDto,
} from './dto/customer-response.dto';

@ApiTags('Customer')
@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('home')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customer dashboard home feed',
    description:
      'Aggregates the customer home dashboard: points balance, points breakdown, live offers, trending businesses, recent activity and nearby deals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer home feed retrieved successfully',
    type: CustomerHomeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error' })
  getHome(@CurrentUser() user: User) {
    return this.customerService.getHome(user.id);
  }

  @Get('promotions')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List customer-facing promotions feed',
    description:
      'Returns a unified promotions feed built from active offers, promotions and neighbourhood campaigns. Filterable by type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotions feed retrieved',
    type: [PromotionItemResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getPromotions(@Query() query: ListCustomerPromotionsQueryDto) {
    return this.customerService.getPromotions(query);
  }

  @Get('rewards')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get rewards catalog, points balance and redemption history',
    description:
      'Returns the available reward catalog, points breakdown, the current user redeemed rewards and soon-to-expire rewards.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rewards data retrieved',
    type: CustomerRewardsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getRewards(@CurrentUser() user: User) {
    return this.customerService.getRewards(user.id);
  }

  @Post('rewards/redeem')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Redeem a reward using loyalty points',
    description:
      'Deducts the reward cost from the user points balance and records the redemption transactionally.',
  })
  @ApiResponse({
    status: 201,
    description: 'Reward redeemed successfully',
    type: RedeemRewardResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Insufficient points or reward already claimed',
  })
  @ApiNotFoundResponse({ description: 'Reward not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  redeemReward(@CurrentUser() user: User, @Body() dto: RedeemRewardDto) {
    return this.customerService.redeemReward(user.id, dto);
  }

  @Post('rewards/redeem-code')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Redeem a promo code for bonus points',
    description:
      'Validates a reward code (e.g. MCOM2024) and credits the bonus points to the user account. One use per account.',
  })
  @ApiResponse({
    status: 201,
    description: 'Code redeemed successfully',
    type: RedeemCodeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Code already redeemed' })
  @ApiNotFoundResponse({ description: 'Invalid code' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  redeemCode(@CurrentUser() user: User, @Body() dto: RedeemCodeDto) {
    return this.customerService.redeemCode(user.id, dto);
  }

  @Get('discover')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get discover feed for the customer app',
    description:
      'Aggregates trending businesses, borough campaigns, promotions, upcoming events and the nearby business directory.',
  })
  @ApiResponse({
    status: 200,
    description: 'Discover feed retrieved',
    type: DiscoverResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getDiscover() {
    return this.customerService.getDiscover();
  }

  @Get('discover/businesses/:businessId')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a business profile for the customer discover flow',
    description:
      'Returns the business details, published reviews, active offers and events.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({
    status: 200,
    description: 'Business profile retrieved',
    type: CustomerBusinessProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getBusinessProfile(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.customerService.getBusinessProfile(businessId);
  }

  @Get('events')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List upcoming customer-facing events',
    description:
      'Returns the upcoming and active events feed for the customer app.',
  })
  @ApiResponse({
    status: 200,
    description: 'Events feed retrieved',
    type: [CustomerEventsResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getEvents() {
    return this.customerService.getEvents();
  }

  @Post('events/rsvp')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'RSVP to a customer-facing event' })
  @ApiResponse({
    status: 201,
    description: 'RSVP recorded',
    type: RsvpEventResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  rsvpEvent(@CurrentUser() user: User, @Body() dto: RsvpEventDto) {
    return this.customerService.rsvpEvent(user.id, dto.eventId);
  }

  @Get('gamify/status')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get gamification status for the customer app',
    description:
      'Returns the daily spin state, scratch card state and active challenges with the current user progress.',
  })
  @ApiResponse({
    status: 200,
    description: 'Gamification status retrieved',
    type: GamifyStatusResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getGamifyStatus(@CurrentUser() user: User) {
    return this.customerService.getGamifyStatus(user.id);
  }

  @Post('gamify/daily-spin')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Perform a daily spin',
    description:
      'Spins the wheel for a random prize (points, voucher or surprise). Limited to one spin per day per user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Spin result returned',
    type: SpinResultDto,
  })
  @ApiBadRequestResponse({ description: 'Daily spin already used today' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  dailySpin(@CurrentUser() user: User) {
    return this.customerService.dailySpin(user.id);
  }

  @Post('gamify/scratch-card')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Scratch a card for a random prize',
    description:
      'Scratches a virtual card for points, voucher, reward or no-win. Limited to one scratch per day per user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Scratch result returned',
    type: ScratchResultDto,
  })
  @ApiBadRequestResponse({ description: 'Scratch card already used today' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  scratchCard(@CurrentUser() user: User) {
    return this.customerService.scratchCard(user.id);
  }

  @Get('challenges')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active customer challenges' })
  @ApiResponse({
    status: 200,
    description: 'Challenges retrieved',
    type: [ChallengeResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  getChallenges() {
    return this.customerService.getChallenges();
  }

  @Post('challenges/:challengeId/progress')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update progress on a challenge',
    description:
      'Updates the current user progress for a challenge. Awards the reward points transactionally when the target is reached.',
  })
  @ApiParam({ name: 'challengeId', description: 'Challenge UUID' })
  @ApiResponse({
    status: 201,
    description: 'Progress updated',
    type: UpdateChallengeProgressResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Challenge not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or expired JWT token' })
  updateChallengeProgress(
    @CurrentUser() user: User,
    @Param('challengeId', ParseUUIDPipe) challengeId: string,
    @Body() dto: UpdateChallengeProgressDto,
  ) {
    return this.customerService.updateChallengeProgress(
      user.id,
      challengeId,
      dto.progress,
    );
  }
}

@ApiTags('Customer')
@Public()
@Controller('customer/public')
export class CustomerPublicController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('events')
  @ApiOperation({
    summary: 'List upcoming public customer events',
    description:
      'Public endpoint returning the upcoming events feed without authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Events feed retrieved',
    type: [CustomerEventsResponseDto],
  })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error' })
  getEvents() {
    return this.customerService.getEvents();
  }
}
