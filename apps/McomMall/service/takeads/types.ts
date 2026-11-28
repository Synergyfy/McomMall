export type TakeadsOfferType = 'product' | 'service' | 'coupon' | 'deal';

export interface PublicTakeadsOffer {
  id: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  merchantName?: string | null;
  images?: string[] | null;
  offerType: TakeadsOfferType;
  campaignLabel?: string | null;
  placement: string;
  countryCode: string;
  currency: string;
  price?: number | null;
  visibility?: 'public' | 'plan_only';
  termsAndConditions?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isFeatured: boolean;
  couponCode?: string | null;
  sourceLabel: string;
  affiliateDisclosure: string;
  external: boolean;
  created_at?: string;
}

export interface PublicTakeadsOfferPage {
  data: PublicTakeadsOffer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Authenticated business feed, scoped to the user's effective plan variant. */
export interface BusinessTakeadsOfferPage extends PublicTakeadsOfferPage {
  planVariantId: string | null;
  planLabel: string | null;
}

export interface PublicTakeadsFilters {
  q?: string;
  categoryId?: string;
  sectorId?: string;
  merchantId?: string;
  offerType?: TakeadsOfferType;
  placement?: string;
  country?: string;
  page?: number;
  limit?: number;
}
