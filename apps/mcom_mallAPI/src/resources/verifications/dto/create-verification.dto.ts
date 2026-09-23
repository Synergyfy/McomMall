import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationSubjectType } from '../entities/verification.entity';

export class CreateVerificationDto {
  @ApiProperty({ enum: VerificationSubjectType })
  @IsEnum(VerificationSubjectType)
  subjectType: VerificationSubjectType;

  @ApiPropertyOptional({ description: 'User or business UUID under review' })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ example: 'Serenity Spa & Wellness' })
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ example: 'business_license' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/docs/bl-biz3.pdf' })
  @IsUrl()
  @IsOptional()
  documentUrl?: string;
}
