export interface AssetCategory {
  id: string;
  name: string;
  ownerId: string;
  created_at: string;
  updated_at: string;
}

export interface GiftCardAsset {
  id: string;
  name: string;
  url: string;
  ownerId: string;
  created_at: string;
  updated_at: string;
  categories: AssetCategory[];
}

export type PaymentProvider = "stripe" | "paypal";

export interface InitiatePurchaseDto {
  templateId: string;
  amount: number;
  recipientEmail: string;
  paymentProvider: PaymentProvider;
  recipientName?: string;
  senderName?: string;
  personalMessage?: string;
  assetId?: string;
  htmlBody?: string;
}

export interface VerifyPurchaseDto {
  paymentProvider: PaymentProvider;
  transactionId: string;
  purchaseDetails: InitiatePurchaseDto;
}