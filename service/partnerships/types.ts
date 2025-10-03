import { IUser } from '@/service/user/types';

export interface IPartnership {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester: IUser;
  provider: IUser;
  created_at: string;
  updated_at: string;
}