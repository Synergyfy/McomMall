import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { BroadcastSegmentDto } from './dto/broadcast-segment.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get unread notifications for current user' })
  getNotifications(@Req() req: Request) {
    return this.notificationService.getNotifications(req.user.id);
  }

  @Post('seen')
  @ApiOperation({ summary: 'Mark notifications as seen' })
  markAsSeen(@Body('notificationIds') notificationIds: string[]) {
    return this.notificationService.markAsSeen(notificationIds);
  }

  @Post('broadcast/segment')
  @ApiOperation({
    summary: 'Send an alert to a business customer segment',
  })
  broadcastSegment(
    @Req() req: Request,
    @Body() dto: BroadcastSegmentDto,
  ) {
    return this.notificationService.broadcastToSegment(req.user.id, dto);
  }

  @Get('recipients/count')
  @ApiOperation({ summary: 'Count customers matching a segment' })
  countRecipients(
    @Req() req: Request,
    @Query('businessId') businessId?: string,
    @Query('segmentId') segmentId?: string,
  ) {
    return this.notificationService
      .countRecipients(req.user.id, businessId, segmentId)
      .then((count) => ({ count }));
  }

  @Post('broadcast')
  @ApiOperation({
    summary: 'Send a broadcast alert or event invitation to customers',
  })
  @ApiResponse({
    status: 201,
    description: 'Broadcast notification sent successfully',
  })
  broadcast(@Req() req: Request, @Body() dto: BroadcastNotificationDto) {
    return this.notificationService.broadcast(req.user.id, dto);
  }
}
