export interface GiftCardHistory {
  id: string;
  giftCardId: string;
  orderId: string;
  amount: number;
  type: 'REDEEM' | 'PURCHASE';
  notes: string | null;
  created_at: string;
}