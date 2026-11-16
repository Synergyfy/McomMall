import { Tier } from '../tiers/types';
import { PlanType } from '../payments/types';

export interface Membership {
  id: string;
  isActive: boolean;
  planType: PlanType; // 'monthly' | 'quarterly' | 'annual'
  expiresAt: string;
  tier: Tier;

  // New plans model purchase snapshot (resolved via public GET /plans)
  planVariantId?: string | null;
  priceId?: string | null;

  // Trial / entitlement fields returned by the central membership sync
  isTrial?: boolean;
  accessType?: string;
  entitlement?: any;
  packages?: any[];

  // Legacy/Optional fields (in case backend still sends them or for backward compat during migration)
  userId?: string;
  tierId?: string;
  status?: string;
  billingCycle?: PlanType;
  startDate?: string;
  endDate?: string;
  nextBillingDate?: string;
  amount?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  trialDuration?: number;
}

export interface CreateMembershipDto {
  tier?: 'basic' | 'extended' | 'professional';
  planVariantId?: string;
  planType?: 'monthly' | 'annual' | 'quarterly';
  paymentProvider: 'stripe' | 'paypal' | 'mcom_wallet';
  idempotencyKey?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface VerifyPaymentDto {
  paymentProvider: 'stripe' | 'paypal' | 'mcom_wallet';
  transactionId?: string;
  holdId?: string;
  purchaseDetails: {
    tier?: 'basic' | 'extended' | 'professional';
    planVariantId?: string;
    planType?: 'monthly' | 'annual' | 'quarterly';
  };
}
