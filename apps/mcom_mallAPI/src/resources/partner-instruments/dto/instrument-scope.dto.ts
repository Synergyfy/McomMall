import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ScopeMode } from '../enums';

/**
 * Partner-supplied instrument scope. Validation of existence/ownership is
 * performed server-side in `InstrumentScopeService`; DTO validation only
 * checks shape.
 */
export class InstrumentScopeDto {
  @ApiProperty({ enum: ScopeMode, example: ScopeMode.ITEMS })
  @IsEnum(ScopeMode)
  mode: ScopeMode;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  listingIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  productIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  serviceIds?: string[];
}
