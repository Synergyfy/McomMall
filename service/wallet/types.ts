export interface Wallet {
  id: string;
  createdAt: string;
  updatedAt: string;
  balance: number;
  totalOrders: number;
  withdrawableBalance: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  total: number;
  items: OrderItem[];
}

export interface WalletData {
  wallet: Wallet;
  lastTenOrders: Order[];
}
