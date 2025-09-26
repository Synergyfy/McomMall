export interface ValidateGiftCardDto {
  giftCardCode: string;
}

export interface ValidateGiftCardResponse {
  isValid: boolean;
  balance: number;
}

export interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  businessId: string;
  fixedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount: number;
  maxCustomAmount: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  date: string;
  amount: number;
  giftCard: {
    code: string;
    template: GiftCardTemplate;
  };
  purchaseBusiness: {
    businessName: string;
  };
  code: string;
  recipientEmail: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface InitiatePurchaseDto {
  templateId: string;
  amount: number;
}

export interface InitiatePurchaseResponse {
  purchaseId: string;
  clientSecret: string;
  provider: string;
  orderId?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialBalance: number;
  recipientEmail: string;
}

export interface VerifyPurchaseDto {
  purchaseId: string;
  paymentIntentId: string;
  paymentProvider: string;
  transactionId: string;
  purchaseDetails: InitiatePurchaseDto;
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