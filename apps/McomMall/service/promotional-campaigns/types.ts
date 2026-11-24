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
export type PromotionalCampaignStatus = 'draft' | 'active' | 'inactive';

export interface CampaignItem {
  id: string;
  itemType: CampaignItemType;
  productId?: string | null;
  serviceId?: string | null;
  offerId?: string | null;
  ownerBusinessId?: string | null;
  title: string;
  imageUrl?: string | null;
  price?: number | null;
  destinationUrl?: string | null;
}

export interface CampaignParticipant {
  id: string;
  businessId: string;
  businessName: string;
  status: CampaignParticipationStatus;
  invitedAt?: string;
  respondedAt?: string | null;
}

export interface PromotionalCampaign {
  id: string;
  name: string;
  description?: string | null;
  termsAndConditions?: string | null;
  status: PromotionalCampaignStatus;
  startDate?: string | null;
  endDate?: string | null;
  rewardType: string;
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
  participants?: CampaignParticipant[];
  acceptedCount?: number;
  participationStatus?: CampaignParticipationStatus;
  respondedAt?: string | null;
}

export interface MyCampaignsResponse {
  businessId: string;
  businessName: string;
  data: PromotionalCampaign[];
  total: number;
}

export interface PublicCampaignsResponse {
  businessId: string;
  businessName: string;
  data: PromotionalCampaign[];
}
