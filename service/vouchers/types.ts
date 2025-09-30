export interface Voucher {
  id: string;
  code: string;
  initialValue: string;
  balance: string;
  status: 'unredeemed' | 'redeemed' | 'partially_redeemed' | 'expired' | 'disabled';
  recipientName?: string;
  recipientEmail?: string;
  personalMessage?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  deliveryDate?: string;
  business: any; // Define Business type if available
  buyer: any; // Define User type if available
  recipient?: any; // Define User type if available
  order: any; // Define Order type if available
  voucherProduct?: VoucherProduct;
  transactions: VoucherTransaction[];
}

export interface VoucherProduct {
  id: string;
  name: string;
  description?: string;
  fixedAmounts: number[];
  usage: 'online_only' | 'instore_only' | 'both';
  isEnabled: boolean;
  expiryDays?: number;
  allowPartialRedemption: boolean;
  business: any; // Define Business type if available
  vouchers: Voucher[];
}

export interface VoucherTransaction {
  id: string;
  voucher: Voucher;
  amount: number;
  type: 'redemption' | 'reversal' | 'refund';
  createdAt: string;
  notes?: string;
  processedBy?: any; // Define User type if available
}

export interface CreateVoucherProductDto {
  name: string;
  description?: string;
  fixedAmounts: number[];
  usage?: 'online_only' | 'instore_only' | 'both';
  isEnabled?: boolean;
  expiryDays?: number;
  allowPartialRedemption?: boolean;
}

export interface UpdateVoucherProductDto extends Partial<CreateVoucherProductDto> {}

export interface PurchaseVoucherDto {
  voucherProductId: string;
  amount: number;
  recipientName?: string;
  recipientEmail?: string;
  personalMessage?: string;
  deliveryDate?: string;
}

export interface RedeemVoucherDto {
  code: string;
  amount?: number;
}

export interface InitiateVoucherPurchaseDto {
  voucherProductId: string;
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
  recipientName?: string;
  recipientEmail?: string;
  personalMessage?: string;
  deliveryDate?: string;
}

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