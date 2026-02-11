export enum CampaignType {
  PAY_PER_VIEW = 'pay_per_view',
  PAY_PER_CLICK = 'pay_per_click',
}

export enum AdPlacement {
  HOMEPAGE = 'homepage',
  TOP_OF_SEARCH_RESULT = 'top_of_search_result',
  SIDE_BAR = 'side_bar',
}

import { UserListing } from '../listings/types';

export interface CreateCampaignDto {
  businessId: string;
  type: CampaignType;
  startDate: Date;
  endDate?: Date;
  budget: number;
  displayOnlyIfCategory?: string;
  displayOnlyIfRegion?: string;
  enabledForLoggedInUser?: boolean;
  adPlacement: AdPlacement[];
}

export interface Campaign {
  id: string;
  business: UserListing;
  type: CampaignType;
  startDate: string;
  budget: number;
  displayOnlyIfCategory?: string;
  displayOnlyIfRegion?: string;
  enabledForLoggedInUser: boolean;
  adPlacement: AdPlacement[];
  createdAt: string;
  updatedAt: string;
}
