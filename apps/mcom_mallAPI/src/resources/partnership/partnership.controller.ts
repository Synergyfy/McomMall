import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PartnershipService } from './partnership.service';
import { CreatePartnershipRequestDto } from './dto/create-partnership-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PartnershipRequest } from './entities/partnership-request.entity';
import { RespondToPartnershipRequestDto } from './dto/respond-to-partnership-request.dto';
import { Service } from '../services/entities/service.entity';

@ApiTags('Partnerships')
@Controller('partnerships')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new partnership request' })
  @ApiResponse({ status: 201, description: 'The partnership request has been successfully created.', type: PartnershipRequest })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product or Service not found' })
  createPartnershipRequest(
    @Body() createPartnershipRequestDto: CreatePartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<PartnershipRequest> {
    return this.partnershipService.createPartnershipRequest(createPartnershipRequestDto, user);
  }

  @Get('/requests/received')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get received partnership requests' })
  @ApiResponse({ status: 200, description: 'A list of received partnership requests.', type: [PartnershipRequest] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getReceivedPartnershipRequests(@CurrentUser() user: User): Promise<PartnershipRequest[]> {
    return this.partnershipService.getReceivedPartnershipRequests(user);
  }

  @Get('/requests/sent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sent partnership requests' })
  @ApiResponse({ status: 200, description: 'A list of sent partnership requests.', type: [PartnershipRequest] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSentPartnershipRequests(@CurrentUser() user: User): Promise<PartnershipRequest[]> {
    return this.partnershipService.getSentPartnershipRequests(user);
  }

  @Patch('/requests/:id/respond')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a partnership request' })
  @ApiResponse({ status: 200, description: 'The partnership request has been successfully updated.', type: PartnershipRequest })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Partnership request not found' })
  respondToPartnershipRequest(
    @Param('id') id: string,
    @Body() respondToPartnershipRequestDto: RespondToPartnershipRequestDto,
    @CurrentUser() user: User,
  ): Promise<PartnershipRequest> {
    return this.partnershipService.respondToPartnershipRequest(id, respondToPartnershipRequestDto, user);
  }

  @Get('/product/:productId')
  @ApiOperation({ summary: 'Get all active partnerships for a product' })
  @ApiResponse({
    status: 200,
    description: 'A list of services partnered with the product.',
    type: [Service],
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductPartnerships(
    @Param('productId') productId: string,
  ): Promise<Service[]> {
    return this.partnershipService.getProductPartnerships(productId);
  }
}