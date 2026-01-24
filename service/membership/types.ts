import { Tier } from '../tiers/types';

export interface Membership {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  tier: Tier;
  created_at: string;
  updated_at: string;
}

export interface CreateMembershipDto {
  tier: string;
}

export interface VerifyPaymentDto {
  paymentIntentId: string;
  tier: string;
}
