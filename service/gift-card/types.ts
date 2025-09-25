export interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  fixedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  createdAt: string;
}

export interface CreateGiftCardTemplateDto {
  name: string;
  description: string;
  imageUrl: string;
  fixedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
}