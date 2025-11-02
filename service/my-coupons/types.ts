import { CouponProduct } from "@/service/coupon-products/types";

export interface Coupon {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  status: 'unredeemed' | 'redeemed' | 'partially_redeemed' | 'expired' | 'disabled';
  expiresAt: Date | null;
  buyer: any; // The user who purchased the coupon
  owner: any; // The business owner who created the template
  couponProduct: CouponProduct;
}

export interface InitiateReloadDto {
  amount: number;
  paymentMethod: 'stripe' | 'paypal';
}

export interface VerifyReloadDto {
  transactionId: string;
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
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
