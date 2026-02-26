
export interface Coupon {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  status: 'unredeemed' | 'redeemed' | 'partially_redeemed' | 'expired' | 'disabled' | 'ACTIVE' | 'DRAFT';
  expiresAt: Date | string | null;
  buyer: any; // User
  owner: any; // User
  business: any; // Business
  campaign: any; // Campaign
  recipientName?: string;
  recipientEmail?: string;
  couponProduct: any; // CouponProduct
}

export interface InitiateCouponPurchaseDto {
  couponProductId: string;
  amount: number;
  paymentMethod: 'stripe' | 'paypal';
}

export interface VerifyCouponPurchaseDto {
  purchaseDetails: {
    couponProductId: string;
    amount: number;
    recipientName?: string;
    recipientEmail?: string;
    personalMessage?: string;
    deliveryDate?: Date;
  };
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
}

export interface InitiateReloadDto {
  amount: number;
  paymentMethod: 'stripe' | 'paypal';
}

export interface VerifyReloadDto {
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
}
