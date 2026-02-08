export interface Wallet {
  id: string;
  createdAt: string;
  updatedAt: string;
  balance: string;
  totalOrders: number;
  withdrawableBalance: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  total: string;
  items: OrderItem[];
}

export interface WalletData {
  wallet: Wallet;
  lastTenOrders: Order[];
}
