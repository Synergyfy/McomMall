import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@Req() req: Request) {
    return this.notificationService.getNotifications(req.user.id);
  }

  @Post('seen')
  markAsSeen(@Body('notificationIds') notificationIds: string[]) {
    return this.notificationService.markAsSeen(notificationIds);
  }
}
