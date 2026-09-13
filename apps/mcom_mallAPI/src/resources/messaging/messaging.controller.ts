import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { SendCustomerAlertDto } from './dto/send-alert.dto';
import { InviteToEventDto } from './dto/invite-to-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send-alert')
  @ApiOperation({
    summary: 'Send a broadcast alert to targeted customer segments',
  })
  sendAlert(@Body() dto: SendCustomerAlertDto) {
    return this.messagingService.sendAlert(dto);
  }

  @Post('invite-to-event')
  @ApiOperation({
    summary: 'Send event invitations to targeted customer segments',
  })
  inviteToEvent(@Body() dto: InviteToEventDto) {
    return this.messagingService.inviteToEvent(dto);
  }

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request,
  ) {
    const user = await this.usersService.findOne(req.user.id);
    return this.messagingService.create(createMessageDto, user);
  }

  @Get('conversations')
  getConversations(@Req() req: Request) {
    return this.messagingService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  getConversationMessages(@Param('id') id: string) {
    return this.messagingService.getConversationMessages(id);
  }
}
