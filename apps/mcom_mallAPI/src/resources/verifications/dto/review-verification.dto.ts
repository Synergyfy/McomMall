import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewVerificationDto {
  @ApiPropertyOptional({ example: 'License valid until 2027' })
  @IsString()
  @IsOptional()
  reviewNote?: string;
}
