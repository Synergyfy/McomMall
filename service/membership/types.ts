export type MembershipTier = "BASIC" | "EXTENDED" | "PROFESSIONAL";

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export interface InitiateMembershipPaymentDto {
  tier: MembershipTier;
  paymentProvider: PaymentMethod;
}

export interface VerifyMembershipPaymentDto {
  paymentProvider: PaymentMethod;
  transactionId: string;
  purchaseDetails: {
    tier: MembershipTier;
  };
}

export interface Membership {
  id: string;
  tier: MembershipTier;
  isActive: boolean;
  expiresAt: string;
  created_at: string;
  updated_at: string;
}