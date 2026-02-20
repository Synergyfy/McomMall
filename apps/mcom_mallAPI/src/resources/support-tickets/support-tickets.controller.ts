import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('support-tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  create(@Req() req, @Body() createSupportTicketDto: CreateSupportTicketDto) {
    return this.supportTicketsService.createTicket(req.user, createSupportTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all support tickets for the current user (or all for admin)' })
  findAll(@Req() req) {
    return this.supportTicketsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific support ticket including messages' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.supportTicketsService.findOne(req.user, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to a support ticket' })
  addMessage(
    @Req() req,
    @Param('id') id: string,
    @Body() createSupportMessageDto: CreateSupportMessageDto,
  ) {
    return this.supportTicketsService.addMessage(req.user, id, createSupportMessageDto);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Mark a support ticket as resolved' })
  resolve(@Req() req, @Param('id') id: string) {
    return this.supportTicketsService.resolveTicket(req.user, id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Mark a support ticket as closed' })
  close(@Req() req, @Param('id') id: string) {
    return this.supportTicketsService.closeTicket(req.user, id);
  }
}
