export interface VoucherProduct {
  id: string;
  name: string;
  description?: string;
  fixedAmounts?: number[];
  allowCustomAmount?: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  expiryDays?: number;
  usage?: 'both' | 'online_only' | 'instore_only';
  allowPartialRedemption?: boolean;
  isEnabled?: boolean;
  bonusThreshold?: number;
  bonusAmount?: number;
  allowReloading?: boolean;
  backgroundImage?: string;
  textColor?: string;
  media?: string[] | null;
  user?: any;
  voucherType?: string;
  valueType?: string;
  value?: number;
  rules?: string;
  expiryDate?: string | null;
  distributionChannels?: string[];
  status?: string;
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


export interface RedeemVoucherDto {
  code: string;
  amount?: number;
}

export interface Voucher {
  id: string;
  code: string;
  initialValue: string;
  amount?: number; // Added to match page usage
  balance: string;
  status:
  | 'UNREDEEMED' | 'unredeemed'
  | 'PARTIALLY_REDEEMED' | 'partially_redeemed'
  | 'REDEEMED' | 'redeemed'
  | 'EXPIRED' | 'expired'
  | 'DISABLED' | 'disabled';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  recipientEmail?: string;
  recipientName?: string;
  voucherProduct?: VoucherProduct;
  media?: string[] | null;
  user?: any;
  purchaseBusiness?: any;
}

export interface CreateVoucherProductDto {
  id?: string;
  name: string;
  description?: string;
  fixedAmounts?: number[];
  allowCustomAmount?: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  usage?: 'online_only' | 'instore_only' | 'both';
  isEnabled?: boolean;
  expiryDays?: number;
  allowPartialRedemption?: boolean;
  bonusThreshold?: number;
  bonusAmount?: number;
  allowReloading?: boolean;
  backgroundImage?: any;
  textColor?: string;
  voucherType?: string;
  valueType?: string;
  value?: number;
  rules?: string;
  expiryDate?: string | null;
  distributionChannels?: string[];
  status?: string;
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

export interface InitiateReloadDto {
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
}

interface ReloadDetailsDto {
  amount: number;
}

export interface VerifyReloadDto {
  reloadDetails: ReloadDetailsDto;
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
}
/** Balance of a voucher the signed-in user is entitled to (checkout). */
export interface VoucherBalance {
  code: string;
  status: string;
  balance: number;
  currency: string;
  initialValue: number;
  expiresAt: string | null;
  allowPartialRedemption: boolean;
}
