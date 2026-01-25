import { Tier } from '../tiers/types';
import { PlanType } from '../payments/types';

export interface Membership {
  id: string;
  isActive: boolean;
  planType: PlanType; // 'monthly' | 'quarterly' | 'annual'
  expiresAt: string;
  tier: Tier;

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
}

export interface CreateMembershipDto {
  tier: string;
}

export interface VerifyPaymentDto {
  paymentIntentId: string;
  tier: string;
}
