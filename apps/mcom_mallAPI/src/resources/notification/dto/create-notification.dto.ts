import { IsEnum, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../notification.enum';

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsUUID()
  senderId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  entityId: string;
}
