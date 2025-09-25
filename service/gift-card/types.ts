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

export interface InitiatePurchaseDto {
  templateId: string;
  amount: number;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  personalMessage?: string;
  paymentProvider: 'stripe' | 'paypal';
}

export interface VerifyPurchaseDto {
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
  purchaseDetails: InitiatePurchaseDto;
}

export interface InitiatePurchaseResponse {
  provider: 'stripe' | 'paypal';
  clientSecret?: string;
  orderId?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  recipientEmail: string;
  deliveryStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MyPurchase {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  recipientEmail: string;
  purchaseBusiness: {
    businessName: string;
  };
  createdAt: string;
}