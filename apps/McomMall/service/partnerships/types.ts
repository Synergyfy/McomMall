import { Product } from '../listings/types';
import { IService } from '../services/types';
import { User } from '../user/types';

export type PartnershipStatus = 'pending' | 'accepted' | 'declined';

export interface UserPartnershipRequest {
  id: string;
  sender: User;
  receiver: User;
  status: PartnershipStatus;
  message?: string;
  rejectionMessage?: string;
  sentAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface UserPartner {
  partnershipId: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerProfilePicture?: string;
  postcodes: string[];
  acceptedAt?: string;
}

export interface ItemPartnershipRequest {
  id: string;
  partnershipId: string;
  proposerId: string;
  proposer?: User;
  receiver?: User;
  baseProduct?: Product;
  baseService?: IService;
  plusProduct?: Product;
  plusService?: IService;
  status: PartnershipStatus;
  message?: string;
  rejectionMessage?: string;
  sentAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface CreateUserPartnershipRequestDto {
  targetUserId: string;
  message?: string;
}

export interface RespondToUserPartnershipRequestDto {
  status: PartnershipStatus;
  rejectionMessage?: string;
}

export interface CreateItemPartnershipRequestDto {
  userPartnershipId?: string;
  baseProductId?: string;
  baseServiceId?: string;
  plusProductId?: string;
  plusServiceId?: string;
  message?: string;
}

export interface PartnershipAnalytics {
  totalPartners: number;
  pendingUserRequests: number;
  pendingItemRequests: number;
}

// Deprecated (keeping for compatibility during transition)
export type PartnershipRequestStatus = PartnershipStatus;
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
