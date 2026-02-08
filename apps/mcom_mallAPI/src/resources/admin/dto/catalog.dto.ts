import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// --- PRODUCTS ---

export class ProductStatsDto {
  @ApiProperty({ example: 1245 })
  total: number;

  @ApiProperty({ example: 1100 })
  active: number;

  @ApiProperty({ example: 12 })
  outOfStock: number;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 'phone' })
  search?: string;

  @ApiPropertyOptional({ example: 'active' })
  status?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  category?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number;
}

export class AdminProductDto {
  @ApiProperty({ example: 'prod-123' })
  id: string;

  @ApiProperty({ example: 'Wireless Headphones' })
  name: string;

  @ApiProperty({ example: 'TechHub Electronics' })
  businessName: string;

  @ApiProperty({ example: 'biz-456' })
  businessId: string;

  @ApiProperty({ example: 'Electronics' })
  category: string;

  @ApiProperty({ example: 299.99 })
  price: number;

  @ApiProperty({ example: 45 })
  stock: number;

  @ApiProperty({ example: 'active', description: 'active | inactive | out_of_stock' })
  status: string;

  @ApiProperty({ example: 'Premium over-ear headphones with superior sound quality' })
  description: string;

  @ApiProperty({ type: [String], example: ['https://example.com/p1.jpg'] })
  images: string[];

  @ApiProperty({ example: '2025-11-20T00:00:00Z' })
  createdAt: Date;
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [AdminProductDto] })
  data: AdminProductDto[];

  @ApiProperty({ example: 1245 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 125 })
  totalPages: number;
}

// --- SERVICES ---

export class ServiceStatsDto {
  @ApiProperty({ example: 856 })
  total: number;

  @ApiProperty({ example: 800 })
  active: number;

  @ApiProperty({ example: 90, description: 'Average duration in minutes' })
  avgDuration: number;
}

export class ServiceQueryDto {
  @ApiPropertyOptional({ example: 'massage' })
  search?: string;

  @ApiPropertyOptional({ example: 'active' })
  status?: string;

  @ApiPropertyOptional({ example: 'Spa' })
  category?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number;
}

export class AdminServiceDto {
  @ApiProperty({ example: 'serv-789' })
  id: string;

  @ApiProperty({ example: 'Deep Tissue Massage' })
  name: string;

  @ApiProperty({ example: 'Serenity Spa' })
  businessName: string;

  @ApiProperty({ example: 'biz-101' })
  businessId: string;

  @ApiProperty({ example: 'Spa' })
  category: string;

  @ApiProperty({ example: 120.00 })
  price: number;

  @ApiProperty({ example: 90, description: 'Duration in minutes' })
  duration: number;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'Tension-relieving deep tissue massage by professionals' })
  description: string;

  @ApiProperty({ type: [String], example: ['https://example.com/s1.jpg'] })
  images: string[];

  @ApiProperty({ example: '2025-08-10T00:00:00Z' })
  createdAt: Date;
}

export class PaginatedServicesDto {
  @ApiProperty({ type: [AdminServiceDto] })
  data: AdminServiceDto[];

  @ApiProperty({ example: 856 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 86 })
  totalPages: number;
}
