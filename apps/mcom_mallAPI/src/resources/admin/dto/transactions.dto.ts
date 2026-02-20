import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionStatsDto {
  @ApiProperty({ example: 450000.50 })
  totalVolume: number;

  @ApiProperty({ example: 12500.25 })
  totalFees: number;

  @ApiProperty({ example: 42 })
  pendingCount: number;

  @ApiProperty({ example: 15 })
  refundCount: number;
}

export class TransactionQueryDto {
  @ApiPropertyOptional({ example: 'txn-123' })
  search?: string;

  @ApiPropertyOptional({ example: 'completed' })
  status?: string;

  @ApiPropertyOptional({ example: 'payment', enum: ['payment', 'refund', 'payout'] })
  type?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number;
}

export class AdminTransactionDto {
  @ApiProperty({ example: 'txn-123' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  payerName: string;

  @ApiProperty({ example: 'Fashion Boutique' })
  payeeName: string;

  @ApiProperty({ example: 'payment', enum: ['payment', 'refund', 'payout'] })
  type: 'payment' | 'refund' | 'payout';

  @ApiProperty({ example: 250.00 })
  amount: number;

  @ApiProperty({ example: 7.50 })
  fees: number;

  @ApiProperty({ example: 'card' })
  paymentMethod: string;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: '2026-01-11T10:00:00Z' })
  date: Date;

  @ApiPropertyOptional({ example: 'ord-456' })
  orderId?: string;
}

export class PaginatedTransactionsDto {
  @ApiProperty({ type: [AdminTransactionDto] })
  data: AdminTransactionDto[];

  @ApiProperty({ example: 1247 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 125 })
  totalPages: number;
}
