import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ListingStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  approved: number;

  @ApiProperty()
  featured: number;
}

export class ListingQueryDto {
  @ApiPropertyOptional()
  search?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  limit?: number;
}

export class AdminListingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  businessId: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  sector: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  featured: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  type: 'product' | 'service';
}

export class PaginatedListingsDto {
  @ApiProperty({ type: [AdminListingDto] })
  data: AdminListingDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
