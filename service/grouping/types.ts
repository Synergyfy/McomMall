import { User } from '../user/types';

export interface CreateGroupDto {
  name: string;
  localArea: string;
  size: 6 | 12;
  recruitmentDeadline: string; // ISO 8601 Date String
}

export type GroupMemberStatus = 'PENDING_PAYMENT' | 'ACTIVE';

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
  founder?: User;
  members?: GroupMember[];
  wallet?: GroupWallet;
  created_at: string;
  updated_at: string;
}