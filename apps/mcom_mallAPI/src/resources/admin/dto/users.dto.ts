import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ example: 12453, description: 'Total number of users' })
  total: number;

  @ApiProperty({ example: 12000, description: 'Number of active users' })
  active: number;

  @ApiProperty({ example: 45, description: 'Number of suspended users' })
  suspended: number;

  @ApiProperty({ example: 408, description: 'Number of pending users' })
  pending: number;
}

export class UserQueryDto {
  @ApiPropertyOptional({ example: 'john', description: 'Search query for name or email' })
  search?: string;

  @ApiPropertyOptional({ example: 'active', description: 'Filter by status (all, active, suspended, pending)' })
  status?: string;

  @ApiPropertyOptional({ example: 'customer', description: 'Filter by account type (all, customer, business, admin)' })
  type?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  limit?: number;
}

export class AdminUserDto {
  @ApiProperty({ example: 'user-123' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 'customer', description: 'customer | business | admin' })
  accountType: string;

  @ApiProperty({ example: 'active', description: 'active | suspended | pending' })
  status: string;

  @ApiProperty({ example: 250.50 })
  walletBalance: number;

  @ApiProperty({ example: '2026-01-11T10:00:00Z', nullable: true })
  lastLogin: Date;

  @ApiProperty({ example: '2025-06-15T08:30:00Z' })
  signupDate: Date;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar?: string;

  @ApiProperty({ example: 'Some admin notes here', nullable: true })
  notes?: string;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [AdminUserDto] })
  data: AdminUserDto[];

  @ApiProperty({ example: 12453 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1246 })
  totalPages: number;
}
