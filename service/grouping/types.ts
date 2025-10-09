import { User } from '../user/types';

export interface CreateGroupDto {
  name: string;
  localArea: string;
  size: 6 | 12;
  recruitmentDeadline: string;
  pitchUrl?: string;
}

export type GroupMemberStatus =
  | 'active'
  | 'inactive'
  | 'pending_payment'
  | 'expired';

export interface InitiateContributionPaymentDto {
  paymentProvider: 'stripe' | 'paypal';
}

export interface VerifyContributionPaymentDto {
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
}

export interface GroupWallet {
  id: string;
  balance: number | string;
  groupId: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  status: GroupMemberStatus;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  localArea: string;
  size: 6 | 12;
  status: 'RECRUITING' | 'ACTIVE' | 'EXPIRED' | 'FAILED';
  recruitmentDeadline: string;
  pitchUrl?: string;
  founderId: string;
  members?: GroupMember[];
  wallet?: GroupWallet;
  memberCount?: number;
  created_at: string;
  updated_at: string;
}