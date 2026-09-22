import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class JoinTrialDto {
  @ApiPropertyOptional({
    description: 'The ID of the plan variant to join as a trial.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  planVariantId?: string;

  @ApiPropertyOptional({
    description: 'Legacy plan variant id fallback.',
  })
  @IsUUID()
  @IsOptional()
  tierId?: string;
}
