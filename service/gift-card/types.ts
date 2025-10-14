export interface GiftCardTemplate {
    id: string; // UUID
    name: string;
    description?: string;
    backgroundImageUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    fixedAmounts?: number[];
    allowCustomAmount: boolean;
    minCustomAmount?: number;
    maxCustomAmount?: number;
    expiryPeriodDays?: number;
    isActive: boolean;
    ownerId: string; // User UUID
    allowReloading?: boolean;
}

export interface CreateGiftCardTemplateDto {
  name: string;
  description?: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  fixedAmounts?: number[];
  allowCustomAmount: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  expiryPeriodDays?: number;
  allowReloading?: boolean;
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
  allowReloading?: boolean;
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
  isReloadable: boolean;
}

export interface GiftCardBalanceResponse {
  initialBalance: number;
  currentBalance: number;
  currency: string;
  expiryDate: string;
}

export interface InitiateReloadDto {
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
}

export interface InitiateReloadResponse {
  provider: 'stripe' | 'paypal';
  clientSecret?: string;
  orderId?: string;
}

export interface VerifyReloadDto {
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
  reloadDetails: {
    amount: number;
  };
}

export interface GiftCardStatsDto {
  totalSold: number;
  totalRedeemed: number;
  outstandingLiability: number;
  activeCards: number;
}

export interface GiftCardChartDataDto {
  data: {
    month: string;
    sales: number;
    redemptions: number;
  }[];
}

export interface BulkCreateGiftCardDto {
  templateId: string;
  amount: number;
  quantity: number;
}

export interface ImportGiftCardDto {
  amount: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  personalMessage?: string;
}

export interface ImportGiftCardsDto {
  giftCards: ImportGiftCardDto[];
}

export interface ImportGiftCardResponse {
  successCount: number;
  errorCount: number;
  errors: string[];
}