import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUserPromotionsDto {
  @ApiPropertyOptional({
    description: 'Filter by promotion status',
    enum: ['active', 'expired'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'expired'])
  status?: string;
}
