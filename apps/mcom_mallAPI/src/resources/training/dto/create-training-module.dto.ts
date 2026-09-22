import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainingKind } from '../entities/training-module.entity';

export class CreateTrainingModuleDto {
  @ApiProperty({ example: 'Seller Onboarding 101' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: TrainingKind })
  @IsEnum(TrainingKind)
  kind: TrainingKind;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/training/onboarding-101.mp4' })
  @IsUrl()
  @IsOptional()
  contentUrl?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
