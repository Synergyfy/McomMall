export type CampaignStatus = 'active' | 'paused' | 'ended';
export type CampaignType = 'ppv' | 'ppc';

export interface Campaign {
  id: string;
  listingName: string;
  status: CampaignStatus;
  type: CampaignType;
  startDate: Date;
  budget: number;
  spent: number;
  placements: string[];
}
