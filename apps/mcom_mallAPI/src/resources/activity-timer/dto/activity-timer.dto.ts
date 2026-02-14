import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ActivityTimerType } from '../enums/activity-task-type.enum';

export class CreateActivityTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ enum: ActivityTimerType })
  @IsEnum(ActivityTimerType)
  type: ActivityTimerType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ required: false, description: 'Required for GENERAL tasks' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class PublishTaskDto extends CreateActivityTaskDto {
  @ApiProperty({ type: [String], description: 'List of Tier IDs to target. Empty means all tiers.' })
  @IsOptional()
  targetTierIds?: string[];

  @ApiProperty({ description: 'Duration in days for GENERAL tasks (alternative to fixed expiry)', required: false })
  @IsOptional()
  @IsNumber()
  durationDays?: number;
}
