import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OnboardingInputType } from '../entities/onboarding-question.entity';

export class CreateOnboardingQuestionDto {
  @ApiProperty({ example: 'Welcome' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "What's the name of your business?" })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({ enum: OnboardingInputType })
  @IsEnum(OnboardingInputType)
  inputType: OnboardingInputType;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateOnboardingQuestionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiPropertyOptional({ enum: OnboardingInputType })
  @IsEnum(OnboardingInputType)
  @IsOptional()
  inputType?: OnboardingInputType;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ReorderOnboardingQuestionsDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Question IDs in display order' })
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}
