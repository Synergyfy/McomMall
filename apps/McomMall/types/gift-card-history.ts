export interface GiftCardHistory {
  id: string;
  giftCardId: string;
  orderId: string;
  amount: string;
  type: 'REDEEM' | 'PURCHASE';
  notes: string | null;
  created_at: string;
}