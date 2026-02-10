import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PartnershipStatus } from '../partnership-status.enum';

export class RespondToUserPartnershipRequestDto {
  @ApiProperty({ enum: PartnershipStatus })
  @IsEnum(PartnershipStatus)
  status: PartnershipStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionMessage?: string;
}
