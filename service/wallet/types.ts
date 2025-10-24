export interface Wallet {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  balance: string;
  totalOrders: number;
  earningsBalance: string;
  spendableBalance: string;
  earningsFromOrders: string;
  earningsFromGiftCard: string;
  earningsFromVoucher: string;
  earningsFromBookings: string;
  pendingBalance: string;
}

export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  amount: string;
  type: string;
  description: string;
  balanceAfter: string;
}

export interface WalletData {
  wallet: Wallet;
  transactionHistory: Transaction[];
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
