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
  paymentProvider: 'STRIPE' | 'PAYPAL';
}

export interface VerifyPurchaseDto {
  paymentProvider: 'STRIPE' | 'PAYPAL';
  transactionId: string;
  purchaseDetails: Omit<InitiatePurchaseDto, 'paymentProvider'>;
}

export interface InitiatePurchaseResponse {
  provider: 'STRIPE' | 'PAYPAL';
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