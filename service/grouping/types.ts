import { Group, GroupMember } from "../membership/types";

export interface CreateGroupDto {
  name: string;
  localArea: string;
  size: 6 | 12;
  recruitmentDeadline: string;
  pitchUrl?: string;
}

export interface JoinGroupDto {
  groupId: string;
}

export type { Group, GroupMember };