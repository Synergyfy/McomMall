export type MembershipTier = 'BASIC' | 'EXTENDED' | 'PROFESSIONAL';

export interface CreateMembershipDto {
  tier: MembershipTier;
}

export interface VerifyPaymentDto {
  paymentIntentId: string;
  tier: MembershipTier;
}

export interface Membership {
  id: string;
  tier: MembershipTier;
  isActive: boolean;
  expiresAt: string;
  created_at: string;
  updated_at: string;
}