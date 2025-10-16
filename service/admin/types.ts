export interface PageMetaDto {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PageDto<T> {
  data: T[];
  meta: PageMetaDto;
}

export interface PromotionSummaryStatisticsDto {
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalParticipants: number;
}

export interface PromotionTransactionHistoryDto {
  id: string;
  points: number;
  type: 'EARNED' | 'REDEMPTION';
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
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

export type TPromotionTransactionHistoryPage =
  PageDto<PromotionTransactionHistoryDto>;

export type TVoucherTransactionHistoryPage =
  PageDto<VoucherTransactionHistoryDto>;