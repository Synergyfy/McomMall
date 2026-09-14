import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AlertChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

export class SendCustomerAlertDto {
  @ApiProperty({ description: 'Business ID sending the alert' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: 'Title of the broadcast alert' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Message body' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Channel to send broadcast' })
  @IsOptional()
  @IsEnum(AlertChannel)
  channel?: AlertChannel = AlertChannel.IN_APP;

  @ApiPropertyOptional({ description: 'Target segment IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];
}
