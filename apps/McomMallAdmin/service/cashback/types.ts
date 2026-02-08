export interface CashbackRule {
  id: string;
  platform: 'MCOM_MALL' | 'MCOM_LOYALTY';
  eventType: string;
  rewardType: 'PERCENTAGE' | 'FIXED';
  rewardValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

export interface CreateRulePayload {
  platform: 'MCOM_MALL' | 'MCOM_LOYALTY';
  eventType: string;
  rewardType: 'PERCENTAGE' | 'FIXED';
  rewardValue: number;
  isActive: boolean;
}

export interface UpdateRulePayload {
  platform?: 'MCOM_MALL' | 'MCOM_LOYALTY';
  eventType?: string;
  rewardType?: 'PERCENTAGE' | 'FIXED';
  rewardValue?: number;
  isActive?: boolean;
}

export interface CashbackTransaction {
  id: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT';
  sourcePlatform: string;
  eventType: string;
  referenceId?: string;
  createdAt: string;
  wallet: {
    id: string;
    user: {
      id: string;
      email: string;
    };
  };
}

export interface HistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CashbackHistoryResponse {
  data: CashbackTransaction[];
  meta: HistoryMeta;
}

export interface HistoryQueryParams {
  page?: number;
  limit?: number;
  email?: string;
  sort?: 'ASC' | 'DESC';
}

export interface CashbackBalanceResponse {
  balance: string; // Assuming it comes as a string based on other amounts, or could be number. I'll handle parsing.
}
