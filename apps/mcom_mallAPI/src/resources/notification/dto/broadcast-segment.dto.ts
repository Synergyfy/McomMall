import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification.enum';

export class BroadcastSegmentDto {
  @ApiProperty({ description: 'Notification title or headline' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Business whose customers are targeted' })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ description: 'Customer segment to target' })
  @IsOptional()
  @IsUUID()
  segmentId?: string;

  @ApiPropertyOptional({ description: 'Delivery channel', example: 'in_app' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Associated entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;
}
