import { IsOptional, IsNumber, IsString, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DiscoverTab {
  NEARBY = 'nearby',
  TRENDING = 'trending',
  BOROUGH = 'borough',
  HIGH_STREET = 'highstreet',
  CATEGORIES = 'categories',
  RECOMMENDED = 'recommended',
  RECENTLY_VIEWED = 'recently-viewed',
}

export class DiscoverQueryDto {
  @ApiPropertyOptional({ description: 'Tab to fetch data for', enum: DiscoverTab })
  @IsOptional()
  @IsEnum(DiscoverTab)
  tab?: DiscoverTab;

  @ApiPropertyOptional({ description: 'Latitude for nearby search' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude for nearby search' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Borough filter' })
  @IsOptional()
  @IsString()
  borough?: string;
}

export class EventsQueryDto {
  @ApiPropertyOptional({ description: 'Tab to fetch events for' })
  @IsOptional()
  @IsString()
  tab?: 'upcoming' | 'nearby' | 'borough' | 'joined' | 'live' | 'recommended';

  @ApiPropertyOptional({ description: 'Latitude for nearby events' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude for nearby events' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @ApiPropertyOptional({ description: 'Borough filter' })
  @IsOptional()
  @IsString()
  borough?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 6 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 6;

  @ApiPropertyOptional({ description: 'Joined event IDs (comma-separated)' })
  @IsOptional()
  @IsString()
  joinedIds?: string;

  @ApiPropertyOptional({ description: 'Saved event IDs (comma-separated)' })
  @IsOptional()
  @IsString()
  savedIds?: string;
}

export class RewardsQueryDto {
  @ApiPropertyOptional({ description: 'Tab to fetch rewards for' })
  @IsOptional()
  @IsString()
  tab?: 'my-points' | 'available' | 'redeemed' | 'loyalty' | 'expiring';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 10;
}