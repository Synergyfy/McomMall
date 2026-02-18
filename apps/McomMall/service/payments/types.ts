
export enum PlanType {
  // Existing
  PAYG = 'PAYG',
  CO_BRANDED = 'CO_BRANDED',
  // New
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

export enum PaygOption {
  NINETY_DAYS = 'NINETY_DAYS',
  ONE_EIGHTY_DAYS = 'ONE_EIGHTY_DAYS',
  TWO_SEVENTY_DAYS = 'TWO_SEVENTY_DAYS',
}

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export enum PaymentPurpose {
  MEMBERSHIP = 'MEMBERSHIP',
  VOUCHER_PURCHASE = 'VOUCHER_PURCHASE',
  PAYG_TOPUP = 'PAYG_TOPUP',
}

// Payload for Stripe Intent
export interface CreateStripeIntentRequest {
  tierId?: string;           // UUID of the Tier selected (optional for PAYG if needed, but required for Membership)
  planType?: PlanType;       // 'monthly', 'quarterly', or 'annual'
  purpose?: PaymentPurpose;  // 'MEMBERSHIP'
  // Keeping amount for backward compatibility if PAYG still uses it directly
  amount?: number;
  currency?: string;
}

// Payload for PayPal Order
export interface CreatePaypalOrderRequest {
  tierId?: string;           // UUID of the Tier selected
  planType?: PlanType;       // 'monthly', 'quarterly', or 'annual'
  purpose?: PaymentPurpose;  // 'MEMBERSHIP'
  // Keeping amount for backward compatibility
  amount?: number;
}

export interface RecordPaymentRequest {
  paymentGateway: PaymentGateway; // 'STRIPE' or 'PAYPAL'
  transactionId: string;          // Stripe Intent ID (pi_...) or PayPal Order ID
  amount: number;                 // The amount paid (e.g., 29.99)
  currency: string;               // 'gbp'

  planType: PlanType;             // 'monthly', 'quarterly', or 'annual' (or PAYG)
  purpose: PaymentPurpose;        // 'MEMBERSHIP'
  tierId?: string;                 // UUID of the Tier (Optional for PAYG)

  isTrial: boolean;               // false
  paygOption?: PaygOption;            // null (unless top-up)
}

// Retaining old DTOs/Interfaces to avoid breaking existing imports immediately,
// though we should migrate to RecordPaymentRequest.
// RecordPaymentDto was:
/*
export interface RecordPaymentDto {
  amount: number;
  planType: PlanType;
  paygOption?: PaygOption;
  isTrial: boolean;
  paymentGateway: PaymentGateway;
  transactionId: string;
  currency?: string;
}
*/
// The new RecordPaymentRequest covers all of RecordPaymentDto plus new fields.
// I will alias it or extend it.

export type RecordPaymentDto = RecordPaymentRequest;
// Note: This changes RecordPaymentDto to require 'purpose'.
// I should check if existing calls provide 'purpose'.
// If not, I might need to make 'purpose' optional in DTO or update calls.
// PricingCheckoutClient uses it.

export enum SubscriptionStatusEnum {
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  PAID = 'PAID',
  INACTIVE = 'INACTIVE',
}

// This is the response from the /payments/status endpoint
export interface SubscriptionStatusResponse {
  status: SubscriptionStatusEnum;
  planType: PlanType;
  paygOption: PaygOption | null;
  trialEndDate: string | null;
  tasks?: TrialTasks;
}

export interface TrialTasks {
  createdBusiness: boolean;
  createdProductOrService: boolean;
  createdPromotion: boolean;
  createdOffer: boolean;
  createdCoupon: boolean;
}

export interface TrialPause {
  pausedAt: string;
  resumedAt: string | null;
}

// This is the response from the /trial endpoint
export interface TrialStatusResponse {
  isActive: boolean;
  remainingTime: number;
  expiresAt?: string;
  tasks: TrialTasks;
  pauses: TrialPause[];
  // The following fields are derived in the hook for UI convenience
  isPaused?: boolean;
  isTrialPausable?: boolean;
  remainingPauses?: number;
}

export enum TrialAction {
  PAUSE = 'pause',
  RESUME = 'resume',
}

export interface PauseResumeTrialDto {
  action: TrialAction;
}
