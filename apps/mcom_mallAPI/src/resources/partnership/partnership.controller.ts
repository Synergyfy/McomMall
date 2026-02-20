import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PartnershipService } from './partnership.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateUserPartnershipRequestDto } from './dto/create-user-partnership-request.dto';
import { RespondToUserPartnershipRequestDto } from './dto/respond-to-user-partnership-request.dto';
import { CreateItemPartnershipRequestDto } from './dto/create-item-partnership-request.dto';
import { UserPartnershipRequest } from './entities/user-partnership-request.entity';
import { ItemPartnershipRequest } from './entities/item-partnership-request.entity';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Partnerships')
@Controller('partnerships')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) { }

  @Get('search-items')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search for potential items (products/services) to partner with' })
  searchPartnerItems(
    @Query('q') q: string,
    @CurrentUser() user: User,
  ): Promise<any[]> {
    return this.partnershipService.searchPartnerItems(q, user.id);
  }

  @Get('/search-owners')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search for potential owner partners' })
  @ApiResponse({
    status: 200,
    description: 'A list of owners matching the query.',
    type: [User],
  })
  searchOwners(
    @Query('q') q: string,
    @CurrentUser() user: User,
  ): Promise<User[]> {
    return this.partnershipService.searchOwners(q, user.id);
  }

  @Get('/product/:id/plus-items')
  @Public()
  @ApiOperation({ summary: 'Get linked plus items (services/products) for a specific product' })
  getProductPartnerships(
    @Param('id') id: string,
  ): Promise<any[]> {
    return this.partnershipService.getProductPartnerships(id);
  }

  @Get('/service/:id/plus-items')
  @Public()
  @ApiOperation({ summary: 'Get linked plus items (services/products) for a specific service' })
  getServicePartnerships(
    @Param('id') id: string,
  ): Promise<any[]> {
    return this.partnershipService.getServicePartnerships(id);
  }

  @Post('/composite-request')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request partnership with an owner AND a specific item simultaneously' })
  createCompositePartnershipRequest(
    @Body() dto: CreateItemPartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<{ userRequest: UserPartnershipRequest | null, itemRequest: ItemPartnershipRequest }> {
    return this.partnershipService.createCompositePartnershipRequest(dto, user);
  }

  // --- User-to-User Endpoints ---

  @Post('/user-request')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a partnership with another owner' })
  createUserPartnershipRequest(
    @Body() dto: CreateUserPartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<UserPartnershipRequest> {
    return this.partnershipService.createUserPartnershipRequest(dto, user);
  }

  @Patch('/user-request/:id/respond')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a user partnership request' })
  respondToUserPartnershipRequest(
    @Param('id') id: string,
    @Body() dto: RespondToUserPartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<UserPartnershipRequest> {
    return this.partnershipService.respondToUserPartnershipRequest(id, dto, user);
  }

  @Get('/requests/user/received')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get received user partnership requests' })
  getReceivedUserRequests(@CurrentUser() user: User): Promise<UserPartnershipRequest[]> {
    return this.partnershipService.getReceivedUserRequests(user);
  }

  @Get('/requests/user/sent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sent user partnership requests' })
  getSentUserRequests(@CurrentUser() user: User): Promise<UserPartnershipRequest[]> {
    return this.partnershipService.getSentUserRequests(user);
  }

  @Get('/requests/item/received')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get received item partnership requests' })
  getReceivedItemRequests(@CurrentUser() user: User): Promise<ItemPartnershipRequest[]> {
    return this.partnershipService.getReceivedItemRequests(user);
  }

  @Get('/requests/item/sent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sent item partnership requests' })
  getSentItemRequests(@CurrentUser() user: User): Promise<ItemPartnershipRequest[]> {
    return this.partnershipService.getSentItemRequests(user);
  }

  @Get('/my-partners')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active owner partners with their postcodes' })
  getMyPartners(@CurrentUser() user: User): Promise<any[]> {
    return this.partnershipService.getMyPartners(user);
  }

  // --- Item "Plus" Endpoints ---

  @Post('/item-request')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Propose a "plus" item (product/service) link' })
  createItemPartnershipRequest(
    @Body() dto: CreateItemPartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<ItemPartnershipRequest> {
    return this.partnershipService.createItemPartnershipRequest(dto, user);
  }

  @Patch('/item-request/:id/respond')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to an item partnership request' })
  respondToItemPartnershipRequest(
    @Param('id') id: string,
    @Body() dto: RespondToUserPartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<ItemPartnershipRequest> {
    return this.partnershipService.respondToItemPartnershipRequest(id, dto, user);
  }

  @Get('/partner-items/:partnershipId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shared products/services for a specific partnership' })
  getPartnerItems(
    @Param('partnershipId') partnershipId: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.partnershipService.getPartnerItems(partnershipId, user);
  }

  @Get('/analytics')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get summary statistics for partnerships' })
  getAnalytics(@CurrentUser() user: User): Promise<any> {
    return this.partnershipService.getAnalytics(user);
  }
}
