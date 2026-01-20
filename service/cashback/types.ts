export interface CashbackRule {
  id: string;
  platform: string;
  eventType: string;
  rewardType: 'PERCENTAGE' | 'FIXED';
  rewardValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

export interface CashbackBalanceResponse {
  balance: string;
}

export interface CashbackTransaction {
  id: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT';
  sourcePlatform: string;
  eventType: string;
  createdAt: string;
}

export interface CashbackHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CashbackHistoryResponse {
  data: CashbackTransaction[];
  meta: CashbackHistoryMeta;
}

export interface CashbackHistoryParams {
  page?: number;
  limit?: number;
  sort?: 'ASC' | 'DESC';
}
