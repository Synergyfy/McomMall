export interface OrderUser {
  id: string;
  name: string;
  email: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    title: string;
  };
}

export interface Order {
  id: string;
  createdAt: string;
  total: string; // Comes in as a string from the API
  status: string;
  user: OrderUser;
  items: OrderItem[];
}

export interface OrderStats {
  totalSales: number;
  netSales: number;
  orders: number;
  productsSold: number;
  totalEarnings: number;
  grossSales: number;
  balance: number;
}