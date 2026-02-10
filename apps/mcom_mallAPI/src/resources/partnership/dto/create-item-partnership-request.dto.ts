import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateItemPartnershipRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userPartnershipId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  baseProductId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  baseServiceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  plusProductId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  plusServiceId?: string;
}
