import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, IsArray, ValidateNested, IsBoolean, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityTaskType, ActivityTimerType } from '../enums/activity-task-type.enum';

export class ActivityTaskDto {
  @ApiProperty({ enum: ActivityTaskType, example: ActivityTaskType.CREATE_BUSINESS })
  @IsEnum(ActivityTaskType)
  key: ActivityTaskType;

  @ApiProperty({ example: 'Add Business Listing' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Create a profile for your business.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '/dashboard/add-listing' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 7, description: 'Duration in days for this specific task (General timers only)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationDays?: number;
}

export class CreateActivityTimerTemplateDto {
  @ApiProperty({ example: 'Onboarding Timer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Main onboarding flow for new businesses' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ActivityTimerType, example: ActivityTimerType.TRIAL })
  @IsEnum(ActivityTimerType)
  type: ActivityTimerType;

  @ApiProperty({ example: 14 })
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  includedTierIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  excludedTierIds?: string[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isForAllTiers?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({ type: [ActivityTaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityTaskDto)
  tasks: ActivityTaskDto[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateActivityTimerTemplateDto extends PartialType(CreateActivityTimerTemplateDto) {}
