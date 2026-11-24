export type PromotionalCampaignStatus = 'draft' | 'active' | 'inactive';
export type PromotionalRewardType =
  | 'voucher'
  | 'discount'
  | 'cashback'
  | 'gift'
  | 'other';
export type CampaignItemType =
  | 'product'
  | 'service'
  | 'promotional_offer'
  | 'link';
export type CampaignParticipationStatus =
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export interface CampaignItem {
  id?: string;
  itemType: CampaignItemType;
  productId?: string;
  serviceId?: string;
  offerId?: string;
  ownerBusinessId?: string;
  advertiserBusinessId?: string;
  title: string;
  imageUrl?: string;
  price?: number;
  destinationUrl?: string;
  displayOrder?: number;
}

export interface CampaignParticipant {
  id?: string;
  businessId: string;
  businessName?: string;
  status: CampaignParticipationStatus;
  invitedAt?: string;
  respondedAt?: string;
}

export interface PromotionalCampaign {
  id: string;
  name: string;
  description?: string;
  termsAndConditions?: string;
  status: PromotionalCampaignStatus;
  startDate?: string | null;
  endDate?: string | null;
  rewardType: PromotionalRewardType;
  rewardTitle?: string | null;
  rewardDescription?: string | null;
  rewardValue?: number | null;
  availableToAll: boolean;
  isFeatured: boolean;
  promotionalMaterials?: Array<{
    type: 'image' | 'link';
    url: string;
    label?: string;
  }> | null;
  items: CampaignItem[];
  participants: CampaignParticipant[];
  acceptedCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignStats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  acceptedParticipants: number;
}

export interface CampaignPage {
  data: PromotionalCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignFilters {
  search?: string;
  status?: PromotionalCampaignStatus;
  page?: number;
  limit?: number;
}

export interface CampaignPayload {
  name: string;
  description?: string;
  termsAndConditions?: string;
  status: PromotionalCampaignStatus;
  startDate?: string;
  endDate?: string;
  rewardType: PromotionalRewardType;
  rewardTitle?: string;
  rewardDescription?: string;
  rewardValue?: number;
  availableToAll: boolean;
  isFeatured: boolean;
  promotionalMaterials: Array<{
    type: 'image' | 'link';
    url: string;
    label?: string;
  }>;
  businessIds?: string[];
  items: CampaignItem[];
}
