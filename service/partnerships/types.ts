import { User } from '../user/types';

export type PartnershipStatus = 'pending' | 'accepted' | 'rejected' | 'terminated';

export interface IPartnership {
  id: string;
  status: PartnershipStatus;
  requester: User;
  provider: User;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnershipDto {
    providerId: string;
}