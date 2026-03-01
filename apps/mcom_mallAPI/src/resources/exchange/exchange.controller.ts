import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CreateExchangeItemDto } from './dto/create-exchange-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExchangeItem } from './entities/exchange-item.entity';
import { UpdateExchangeItemDto } from './dto/update-exchange-item.dto';
import { CreateExchangeProposalDto } from './dto/create-exchange-proposal.dto';
import { ExchangeProposal } from './entities/exchange-proposal.entity';
import { UpdateExchangeProposalDto } from './dto/update-exchange-proposal.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Escrow } from './entities/escrow.entity';

@ApiTags('Exchange & Barter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('items')
  @ApiOperation({ summary: 'Create a new exchange item' })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
    type: ExchangeItem,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createItem(
    @Body() createDto: CreateExchangeItemDto,
    @CurrentUser() user: User,
  ): Promise<ExchangeItem> {
    return this.exchangeService.createItem(createDto, user);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an exchange item' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully updated.',
    type: ExchangeItem,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateExchangeItemDto,
    @CurrentUser() user: User,
  ): Promise<ExchangeItem> {
    return this.exchangeService.updateItem(id, updateDto, user.id);
  }

  @Post('proposals')
  @ApiOperation({ summary: 'Create a new trade proposal' })
  @ApiResponse({
    status: 201,
    description: 'The proposal has been successfully created.',
    type: ExchangeProposal,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  createProposal(
    @Body() createDto: CreateExchangeProposalDto,
    @CurrentUser() user: User,
  ): Promise<ExchangeProposal> {
    return this.exchangeService.createProposal(createDto, user);
  }

  @Patch('proposals/:id/respond')
  @ApiOperation({ summary: 'Respond to a trade proposal' })
  @ApiResponse({
    status: 200,
    description: 'The proposal has been successfully updated.',
    type: ExchangeProposal,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  respondToProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateExchangeProposalDto,
    @CurrentUser() user: User,
  ): Promise<ExchangeProposal> {
    return this.exchangeService.respondToProposal(id, updateDto, user);
  }

  @Patch('escrow/:id/confirm')
  @ApiOperation({ summary: 'Confirm an exchange in escrow' })
  @ApiResponse({
    status: 200,
    description: 'The exchange has been successfully confirmed.',
    type: Escrow,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Escrow not found.' })
  confirmExchange(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Escrow> {
    return this.exchangeService.confirmExchange(id, user.id);
  }

  @Patch('escrow/:id/cancel')
  @ApiOperation({ summary: 'Cancel an exchange in escrow' })
  @ApiResponse({
    status: 200,
    description: 'The exchange has been successfully cancelled.',
    type: Escrow,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Escrow not found.' })
  cancelExchange(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Escrow> {
    return this.exchangeService.cancelExchange(id, user.id);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get a list of available exchange items' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of available exchange items.',
    type: [ExchangeItem],
  })
  findAllItems(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.exchangeService.findAllItems({ page, limit });
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get a single exchange item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The exchange item.',
    type: ExchangeItem,
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  findOneItem(@Param('id', ParseUUIDPipe) id: string): Promise<ExchangeItem> {
    return this.exchangeService.findOneItem(id);
  }

  @Get('proposals')
  @ApiOperation({ summary: 'Get proposals for the current user' })
  @ApiQuery({
    name: 'type',
    enum: ['sent', 'received'],
    description: 'Type of proposals to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of proposals.',
    type: [ExchangeProposal],
  })
  getProposals(
    @CurrentUser() user: User,
    @Query('type') type: 'sent' | 'received' = 'received',
  ): Promise<ExchangeProposal[]> {
    return this.exchangeService.findProposals(user.id, type);
  }
}
