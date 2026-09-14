import { IsEnum, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification.enum';

export class BroadcastNotificationDto {
  @ApiProperty({ description: 'Notification title or headline' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Target customer segment ID, if targeting a specific segment',
  })
  @IsOptional()
  @IsString()
  segmentId?: string;

  @ApiPropertyOptional({
    description: 'Explicit target recipient user IDs list',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  recipientIds?: string[];

  @ApiPropertyOptional({
    enum: NotificationType,
    default: NotificationType.BROADCAST_ALERT,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Associated entity ID (e.g. event ID, campaign ID)',
  })
  @IsOptional()
  @IsString()
  entityId?: string;
}
