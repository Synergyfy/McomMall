export interface CentralWallet {
  enabled: boolean;
  linked: boolean;
  centralUserId?: string | null;
  balance?: number | null;
  availableBalance?: number | null;
  currency?: string;
  status?: string;
  topUpUrl?: string;
  message?: string;
}

export interface Wallet {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  balance: string | number | null;
  totalOrders: number;
  earningsBalance: string | number;
  spendableBalance: string | number | null;
  earningsFromOrders: string | number;
  earningsFromGiftCard: string | number;
  earningsFromVoucher: string | number;
  earningsFromCoupons: string | number;
  earningsFromBookings: string | number;
  pendingBalance: string | number;
  currency?: string;
  status?: string;
}

export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  amount: string | number;
  type: string;
  category?: string;
  description: string;
  balanceAfter?: string | number;
  reference?: string | null;
  status?: string;
}

export interface CashbackBreakdown {
  terminalCashbackBalance: number;
  normalCashbackBalance: number;
  totalCashbackBalance: number;
}

export interface WalletData {
  success?: boolean;
  status?: string;
  balance?: number | null;
  availableBalance?: number | null;
  currency?: string;
  centralUserId?: string | null;
  errorCode?: string;
  message?: string;
  transactionHistoryError?: string;
  lastSyncedAt?: string | null;
  centralWallet?: CentralWallet;
  wallet: Wallet;
  cashbackBreakdown?: CashbackBreakdown;
  transactionHistory: Transaction[];
  topUpUrl?: string;
}

export interface InitiateFundingDto {
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
}

export interface VerifyFundingDto {
  transactionId: string;
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
}
