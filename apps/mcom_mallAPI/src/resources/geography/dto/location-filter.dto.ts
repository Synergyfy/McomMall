import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export const LOCATION_LEVELS = [
  'city',
  'borough',
  'high-street',
  'local-mall',
  /**
   * Fallback derived from the existing `locations.city` / `resolvedArea`
   * fields. Lets postcode searches work before the Central hierarchy has been
   * backfilled onto old businesses.
   */
  'area',
  /** A UK outward code (e.g. SW1A) matched against `locations.postcode`. */
  'postcode',
] as const;

export type LocationLevel = (typeof LOCATION_LEVELS)[number];

/**
 * Shared location filter accepted by every public discovery endpoint.
 *
 * `locationType` + `locationId`/`locationName` chooses the subtree to filter
 * on. The optional `near*` ids are the shopper's own hierarchy and are only
 * used to order results local-mall → high-street → borough → city when they
 * are looking at a broader scope such as a city.
 */
export class LocationFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: LOCATION_LEVELS,
    description: 'Geographic level to filter by',
  })
  @IsOptional()
  @IsIn(LOCATION_LEVELS)
  locationType?: LocationLevel;

  @ApiPropertyOptional({
    description: 'Central id of the selected city/borough/high street/mall',
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Name of the selected place (used when an id is unavailable)',
  })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({
    description: "Shopper's local mall id, for local-first ordering",
  })
  @IsOptional()
  @IsString()
  nearLocalMallId?: string;

  @ApiPropertyOptional({
    description: "Shopper's high street id, for local-first ordering",
  })
  @IsOptional()
  @IsString()
  nearHighStreetId?: string;

  @ApiPropertyOptional({
    description: "Shopper's borough id, for local-first ordering",
  })
  @IsOptional()
  @IsString()
  nearBoroughId?: string;
}

export class ResolveLocationQueryDto {
  @ApiPropertyOptional({ description: 'UK postcode (e.g. SE15 4AA)' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiPropertyOptional({ description: 'Browser latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({ description: 'Browser longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}
