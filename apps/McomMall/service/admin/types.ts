export interface PageMetaDto {
  page: number;
  limit: number;
  itemCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PageDto<T> {
  data: T[];
  meta: PageMetaDto;
}

export interface VoucherSummaryStatisticsDto {
  totalSold: number;
  totalRedeemed: number;
  outstandingLiability: number;
}

export interface VoucherTransactionHistoryDto {
  id: string;
  amount: number;
  type: 'PURCHASE' | 'REDEMPTION' | 'REVERSAL' | 'REFUND';
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export type TVoucherTransactionHistoryPage =
  PageDto<VoucherTransactionHistoryDto>;