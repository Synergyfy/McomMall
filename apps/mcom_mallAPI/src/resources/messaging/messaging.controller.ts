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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly usersService: UsersService,
  ) {}

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
