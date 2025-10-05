import { Product } from '../listings/types';
import { IService } from '../services/types';
import { User } from '../user/types';

export type PartnershipRequestStatus = 'pending' | 'accepted' | 'declined';

export interface CreatePartnershipRequestDto {
  productId: string;
  serviceId: string;
}

export interface RespondToPartnershipRequestDto {
  status: 'accepted' | 'declined';
}

export interface PartnershipRequest {
  id: string;
  status: PartnershipRequestStatus;
  product: Product;
  service: IService;
  requestingUser: User;
  serviceOwner: User;
  created_at: string;
  updated_at: string;
}