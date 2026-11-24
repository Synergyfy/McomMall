export type PromotionalOfferingType = 'product' | 'service' | 'offer';
export type PromotionalOfferStatus =
  | 'draft'
  | 'active'
  | 'inactive'
  | 'archived';

export interface PromotionalOffer {
  id: string;
  name: string;
  offeringType: PromotionalOfferingType;
  sector?: string | null;
  category?: string | null;
  subCategory?: string | null;
  brand?: string | null;
  tags?: string[] | null;
  shortDescription?: string | null;
  description?: string | null;
  images?: string[] | null;
  price?: number | null;
  salePrice?: number | null;
  currency?: string;
  destinationUrl: string;
  affiliateTrackingUrl?: string | null;
  affiliateNetwork?: string;
  advertiserId?: string | null;
  advertiserName?: string | null;
  advertiserProgramme?: string | null;
  awinProductId?: string | null;
  commissionRate?: number;
  businessCommissionRate?: number;
  availability: 'all' | 'selected';
  status: PromotionalOfferStatus;
  startDate?: string | null;
  endDate?: string | null;
  termsAndConditions?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
  imported?: boolean;
  importedAt?: string | null;
  removedAt?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  claimedAt?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionalOfferPage {
  data: PromotionalOffer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PromotionalCatalogue {
  businessId: string;
  businessName: string;
  data: PromotionalOffer[];
  total: number;
  importedCount: number;
}

export interface AffiliatePerformanceOffer {
  offerId: string;
  name: string;
  offeringType: PromotionalOfferingType;
  advertiserName: string | null;
  images: string[];
  importedAt: string;
  clicks: number;
  transactions: number;
  approvedCommission: number;
  pendingCommission: number;
  rejectedCommission: number;
  conversionRate: number;
}

export interface AffiliatePerformance {
  businessId: string;
  businessName: string;
  summary: {
    promotedOffers: number;
    totalClicks: number;
    transactions: number;
    pendingTransactions: number;
    approvedTransactions: number;
    rejectedTransactions: number;
    approvedCommission: number;
    pendingCommission: number;
    businessEarnings: number;
    conversionRate: number;
  };
  byOffer: AffiliatePerformanceOffer[];
  recentClicks: Array<{
    id: string;
    offerId?: string | null;
    clickRef: string;
    source?: string;
    created_at: string;
  }>;
  recentTransactions: Array<{
    id: string;
    offerId?: string | null;
    status: string;
    commissionAmount?: number | null;
    created_at: string;
  }>;
}
