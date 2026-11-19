import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from 'src/common/moderation/catalog-approval';

export class ModerationQueryDto {
  @ApiPropertyOptional({ example: 'phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ApprovalStatus,
    description: 'Filter by approval state',
  })
  @IsOptional()
  @IsIn(Object.values(ApprovalStatus))
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({
    description: 'true to show only admin-delisted items',
  })
  @IsOptional()
  delisted?: string | boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  limit?: number;
}

export class ReviewModerationDto {
  @ApiPropertyOptional({
    example: 'Please add clearer product images before this can go live.',
  })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
