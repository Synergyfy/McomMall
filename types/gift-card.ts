export interface ActivityLog {
  id: string;
  date: string;
  action: 'Create' | 'Transaction' | 'Adjust' | 'Note';
  user: string;
  note: string;
  amount: number;
  balance: number;
}

export interface GiftCard {
  id: string;
  cardNumber: string;
  balance: number;
  expirationDate: string | null;
  recipient: string;
  activity: ActivityLog[];
}