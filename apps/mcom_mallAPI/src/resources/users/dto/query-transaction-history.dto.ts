import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTransactionHistoryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: ['earn', 'spend'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['earn', 'spend'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter by promotion ID',
  })
  @IsOptional()
  @IsString()
  promotion_id?: string;
}
