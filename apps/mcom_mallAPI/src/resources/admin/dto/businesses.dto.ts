import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessStatsDto {
  @ApiProperty({ example: 3421, description: 'Total number of businesses' })
  total: number;

  @ApiProperty({
    example: 3100,
    description: 'Number of active/published businesses',
  })
  active: number;

  @ApiProperty({
    example: 45,
    description: 'Number of businesses pending review',
  })
  pending: number;

  @ApiProperty({ example: 1250, description: 'Number of verified businesses' })
  verified: number;
}

export class BusinessQueryDto {
  @ApiPropertyOptional({
    example: 'urban',
    description: 'Search query for business or owner name',
  })
  search?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by status (all, active, pending, suspended)',
  })
  status?: string;

  @ApiPropertyOptional({
    example: 'Retail',
    description: 'Filter by sector name',
  })
  sector?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    default: 10,
  })
  limit?: number;
}

export class AdminBusinessDto {
  @ApiProperty({ example: 'biz-123' })
  id: string;

  @ApiProperty({ example: 'Urban Eats Restaurant' })
  name: string;

  @ApiProperty({ example: 'Sarah Johnson' })
  owner: string;

  @ApiProperty({ example: 'user-456' })
  ownerId: string;

  @ApiProperty({
    example: 'active',
    description: 'active | pending | suspended',
  })
  status: string;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: 4.7 })
  rating: number;

  @ApiProperty({ example: 234 })
  reviewCount: number;

  @ApiProperty({ example: 12 })
  listingCount: number;

  @ApiProperty({ example: 'Food & Beverage' })
  sector: string;

  @ApiProperty({ example: 'Italian' })
  category: string;

  @ApiProperty({ example: '123 Main Street, New York, NY 10001' })
  address: string;

  @ApiProperty({ example: 'contact@urbaneats.com' })
  email: string;

  @ApiProperty({ example: '+15551001' })
  phone: string;

  @ApiProperty({ example: '2025-03-20T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 'https://example.com/logo.jpg', nullable: true })
  logo?: string;
}

export class PaginatedBusinessesDto {
  @ApiProperty({ type: [AdminBusinessDto] })
  data: AdminBusinessDto[];

  @ApiProperty({ example: 3421 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 343 })
  totalPages: number;
}

export class AdminBusinessListingDto {
  @ApiProperty({ example: 'listing-123' })
  id: string;

  @ApiProperty({ example: 'Gourmet Pizza Collection' })
  name: string;

  @ApiProperty({ example: 24.99 })
  price: number;

  @ApiProperty({ example: 'published' })
  status: string;

  @ApiProperty({ example: 'product', enum: ['product', 'service'] })
  type: 'product' | 'service';
}
