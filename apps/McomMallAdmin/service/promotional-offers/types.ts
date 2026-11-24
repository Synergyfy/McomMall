export type PromotionalOfferingType = 'product' | 'service' | 'offer';
export type PromotionalOfferStatus =
  | 'draft'
  | 'active'
  | 'inactive'
  | 'archived';

export interface AdminPromotionalOffer {
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
  selectedBusinesses?: Array<{ id: string; name: string }>;
  importedCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminPromotionalOfferPage {
  data: AdminPromotionalOffer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPromotionalOfferStats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  imported: number;
  clicks: number;
  transactions: number;
}

export interface PromotionalOfferFilters {
  search?: string;
  offeringType?: PromotionalOfferingType;
  status?: PromotionalOfferStatus;
  availability?: 'all' | 'selected';
  page?: number;
  limit?: number;
}

export interface CreatePromotionalOfferPayload {
  name: string;
  offeringType: PromotionalOfferingType;
  sector?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  tags?: string[];
  shortDescription?: string;
  description?: string;
  images?: string[];
  price?: number;
  salePrice?: number;
  currency?: string;
  destinationUrl: string;
  affiliateTrackingUrl?: string;
  affiliateNetwork?: string;
  advertiserId?: string;
  advertiserName?: string;
  advertiserProgramme?: string;
  awinProductId?: string;
  commissionRate?: number;
  businessCommissionRate?: number;
  availability: 'all' | 'selected';
  businessIds?: string[];
  status: PromotionalOfferStatus;
  startDate?: string;
  endDate?: string;
  termsAndConditions?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface AffiliateSummary {
  totalClicks: number;
  attributedClicks: number;
  transactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  approvedCommission: number;
  pendingCommission: number;
  conversionRate: number;
}

export interface AffiliateClickRow {
  id: string;
  offerId?: string | null;
  offerName: string;
  businessId?: string | null;
  businessName: string;
  clickRef: string;
  source?: string;
  attributed: boolean;
  createdAt: string;
}

export interface AffiliateTransactionRow {
  id: string;
  externalTransactionId: string;
  offerId?: string | null;
  offerName: string;
  businessId?: string | null;
  businessName: string;
  clickRef?: string | null;
  advertiserName?: string | null;
  status: string;
  saleAmount?: number | null;
  commissionAmount?: number | null;
  currency: string;
  transactionDate?: string | null;
}

export interface PagedAffiliateRows<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
