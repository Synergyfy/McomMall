import { User } from "@/service/user/types";

export type MembershipTier = "BASIC" | "EXTENDED" | "PROFESSIONAL";

export interface CreateMembershipDto {
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

export interface Group {
  id: string;
  name: string;
  localArea: string;
  size: 6 | 12;
  status: "RECRUITING" | "ACTIVE" | "EXPIRED" | "FAILED";
  recruitmentDeadline: string;
  pitchUrl?: string;
  founder: User;
  members: GroupMember[];
  wallet: GroupWallet;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  user: User;
  group: Group;
  created_at: string;
  updated_at: string;
}

export interface GroupWallet {
  id: string;
  balance: number;
  groupId: string;
  created_at: string;
  updated_at: string;
}