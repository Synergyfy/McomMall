import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DisputeReason, DisputeStatus } from '../dispute.enum';

export class CreateDisputeDto {
  @ApiProperty({ example: 'biz-123' })
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @ApiPropertyOptional({ example: 'ord-456' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ example: 45.50 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: DisputeReason, example: DisputeReason.DEFECTIVE })
  @IsEnum(DisputeReason)
  @IsNotEmpty()
  reason: DisputeReason;

  @ApiProperty({ example: 'The product arrived with a broken screen.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/evidence1.jpg'] })
  @IsOptional()
  evidence?: string[];
}

export class DisputeStatsDto {
  @ApiProperty({ example: 156 })
  total: number;

  @ApiProperty({ example: 42 })
  open: number;

  @ApiProperty({ example: 12 })
  underReview: number;

  @ApiProperty({ example: 5 })
  escalated: number;
}

export class DisputeQueryDto {
  @ApiPropertyOptional({ example: 'disp-123' })
  search?: string;

  @ApiPropertyOptional({ enum: DisputeStatus, example: DisputeStatus.UNDER_REVIEW })
  status?: string;

  @ApiPropertyOptional({ enum: DisputeReason, example: DisputeReason.NOT_RECEIVED })
  reason?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number;
}

export class AdminDisputeDto {
  @ApiProperty({ example: 'disp-123' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  customerName: string;

  @ApiProperty({ example: 'user-789' })
  customerId: string;

  @ApiProperty({ example: 'Fashion Hub' })
  businessName: string;

  @ApiProperty({ example: 'biz-101' })
  businessId: string;

  @ApiPropertyOptional({ example: 'ord-456' })
  orderId?: string;

  @ApiProperty({ example: 45.50 })
  amount: number;

  @ApiProperty({ enum: DisputeReason, example: DisputeReason.DEFECTIVE })
  reason: DisputeReason;

  @ApiProperty({ example: 'The product arrived with a broken screen.' })
  description: string;

  @ApiProperty({ enum: DisputeStatus, example: DisputeStatus.NEW })
  status: DisputeStatus;

  @ApiProperty({ type: [String], example: ['https://example.com/ev1.jpg'] })
  evidence: string[];

  @ApiProperty({ example: '2026-01-11T12:00:00Z' })
  createdAt: Date;
}

export class PaginatedDisputesDto {
  @ApiProperty({ type: [AdminDisputeDto] })
  data: AdminDisputeDto[];

  @ApiProperty({ example: 156 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 16 })
  totalPages: number;
}
