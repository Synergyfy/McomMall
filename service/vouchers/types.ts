export interface VoucherProduct {
  id: string;
  name: string;
  description?: string;
  fixedAmounts: number[];
  customAmount?: [number, number];
  expiryDays?: number;
  usage?: 'both' | 'online_only' | 'instore_only';
  allowPartialRedemption?: boolean;
  isEnabled?: boolean;
  backgroundImage?: string;
  textColor?: string;
}

export interface InitiateVoucherPurchaseDto {
  voucherProductId: string;
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
  recipientName?: string;
  recipientEmail?: string;
  personalMessage?: string;
}


export interface RedeemVoucherDto {
  code: string;
  amount?: number;
}

export interface Voucher {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  status:
    | 'UNREDEEMED'
    | 'PARTIALLY_REDEEMED'
    | 'REDEEMED'
    | 'EXPIRED'
    | 'DISABLED';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  recipientEmail?: string;
  voucherProduct?: VoucherProduct;
}

export interface CreateVoucherProductDto {
  name: string;
  description?: string;
  fixedAmounts: number[];
  customAmount?: [number, number];
  expiryDays?: number;
  usage: 'both' | 'online_only' | 'instore_only';
  allowPartialRedemption: boolean;
  isEnabled: boolean;
  backgroundImage?: string;
  textColor?: string;
}

export type UpdateVoucherProductDto = Partial<CreateVoucherProductDto>;

export interface VerifyVoucherPurchaseDto {
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
  purchaseDetails: InitiateVoucherPurchaseDto;
}

export interface StripeVoucherPurchaseResponse {
  provider: 'stripe';
  clientSecret: string;
}

export interface PayPalVoucherPurchaseResponse {
  provider: 'paypal';
  orderId: string;
}

export interface PurchaseVoucherDto {
  voucherProductId: string;
  amount: number;
  recipientEmail?: string;
}