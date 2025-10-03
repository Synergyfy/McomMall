import { IUser } from '@/service/user/types';

export interface IService {
  id: string;
  name: string;
  description: string;
  owner?: IUser;
  // other service fields from your API might go here
}