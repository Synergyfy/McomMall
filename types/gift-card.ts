export interface GiftCard {
  id: string;
  code: string;
  recipient: string;
  balance: number;
  status: 'Active' | 'Used' | 'Cancelled';
  purchaseDate: string;
}

export interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  fixedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount: number;
  maxCustomAmount: number;
}

export type CreateGiftCardTemplateDto = Omit<GiftCardTemplate, 'id'>;

export interface AdjustBalanceDto {
    amount: number;
}