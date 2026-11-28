export type TakeadsApprovalStatus = 'pending' | 'approved' | 'rejected';
export type TakeadsPublicationStatus =
  | 'unpublished'
  | 'published'
  | 'paused'
  | 'expired'
  | 'withdrawn';
export type TakeadsMerchantStatus =
  | 'not_reviewed'
  | 'accepted'
  | 'rejected'
  | 'inactive';
export type TakeadsSourceType = 'coupon' | 'product_url' | 'merchant';
export type TakeadsOfferType = 'product' | 'service' | 'coupon' | 'deal';
export type TakeadsVisibility = 'public' | 'plan_only';
export type TakeadsSyncType = 'merchants' | 'coupons' | 'reports' | 'all';

export interface TakeadsSyncRun {
  id: string;
  type: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string | null;
  itemsReceived: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  errorMessage?: string | null;
}

export interface TakeadsOverview {
  connection: {
    platformConfigured: boolean;
    accountConfigured: boolean;
    dedicatedAccountKey: boolean;
    baseUrl: string;
    syncEnabled: boolean;
  };
  lastSuccessfulSync?: string | null;
  recentSyncRuns: TakeadsSyncRun[];
  counts: {
    merchants: number;
    activeMerchants: number;
    acceptedMerchants: number;
    coupons: number;
    activeCoupons: number;
    offers: number;
    pendingOffers: number;
    approvedOffers: number;
    publishedOffers: number;
  };
  mcomClicks: number;
  takeadsClicks: number;
  actions: TakeadsActionSummary;
}

export interface TakeadsSettings {
  baseUrl: string;
  platformConfigured: boolean;
  accountConfigured: boolean;
  dedicatedAccountKey: boolean;
  syncEnabled: boolean;
  defaultCountry: string;
  defaultLanguage: string;
}

export interface TakeadsMerchantDetail extends TakeadsMerchant {
  coupons: TakeadsCoupon[];
  offers: TakeadsOffer[];
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface TakeadsMerchant {
  id: string;
  externalMerchantId: string;
  name: string;
  imageUrl?: string | null;
  defaultDomain?: string | null;
  domains?: string[] | null;
  description?: string | null;
  upstreamCategoryId?: string | null;
  currencyCode?: string | null;
  countryCodes?: string[] | null;
  isActive: boolean;
  deeplinkAllowed: boolean;
  commissionMetadata?: Record<string, unknown> | null;
  trackingLink?: string | null;
  lastSyncedAt?: string | null;
  mcomStatus: TakeadsMerchantStatus;
  mcomSectorId?: string | null;
  mcomCategoryId?: string | null;
  mcomSubCategoryId?: string | null;
  reviewNote?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TakeadsCoupon {
  id: string;
  externalCouponId: string;
  merchantId?: string | null;
  externalMerchantId?: string | null;
  name: string;
  code?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  trackingLink?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  countryCodes?: string[] | null;
  approvalStatus: TakeadsApprovalStatus;
  publicationStatus: TakeadsPublicationStatus;
  adminDisabled: boolean;
  reviewNote?: string | null;
  lastSyncedAt?: string | null;
  created_at?: string;
}

export interface TakeadsOffer {
  id: string;
  sourceType: TakeadsSourceType;
  externalMerchantId?: string | null;
  externalCouponId?: string | null;
  externalProgramId?: string | null;
  merchantName?: string | null;
  destinationUrl: string;
  resolvedTrackingUrl?: string | null;
  linkResolvedAt?: string | null;
  subId?: string | null;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  images?: string[] | null;
  imageSource?: string | null;
  mcomSectorId?: string | null;
  mcomCategoryId?: string | null;
  mcomSubCategoryId?: string | null;
  countryCode: string;
  currency: string;
  price?: number | null;
  visibility: TakeadsVisibility;
  allowedPlanVariantIds: string[];
  offerType: TakeadsOfferType;
  campaignLabel?: string | null;
  placement: string;
  termsAndConditions?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  approvalStatus: TakeadsApprovalStatus;
  publicationStatus: TakeadsPublicationStatus;
  upstreamActive: boolean;
  adminDisabled: boolean;
  isFeatured: boolean;
  displayOrder: number;
  reviewNote?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PagedTakeads<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TakeadsActionSummary {
  total: number;
  byStatus: {
    PENDING: number;
    CONFIRMED: number;
    CANCELED: number;
    SETTLED: number;
  };
  validatedRevenue: number;
  pendingRevenue: number;
  advertiserPaid: number;
  byCurrency?: Array<{
    currency: string;
    validatedRevenue: number;
    pendingRevenue: number;
    actions: number;
  }>;
}

export interface TakeadsReportSummary {
  period: { from: string; to: string };
  mcomClicks: number;
  takeadsClicks: number;
  actions: TakeadsActionSummary;
}

export interface TakeadsAction {
  id: string;
  actionId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'SETTLED';
  type?: string | null;
  merchantId?: string | null;
  couponId?: string | null;
  subId?: string | null;
  orderAmount?: string | null;
  publisherRevenue?: string | null;
  currencyCode?: string | null;
  advertiserPaid?: boolean | null;
  orderDate?: string | null;
  sourceUpdatedAt?: string | null;
}

export interface TakeadsMcomClick {
  id: string;
  offerId?: string | null;
  merchantId?: string | null;
  couponId?: string | null;
  clickRef: string;
  subId?: string | null;
  source?: string | null;
  placement?: string | null;
  created_at: string;
}

export interface TakeadsClickReport {
  id: string;
  date: string;
  merchantId?: string | null;
  merchantName?: string | null;
  couponId?: string | null;
  subId?: string | null;
  count: number;
}

export interface ResolveTakeadsLinkPayload {
  destinationUrl: string;
  externalMerchantId?: string;
  externalProgramId?: string;
  placement?: string;
}

export interface ResolveTakeadsLinkResult {
  destinationUrl: string;
  resolvedTrackingUrl: string;
  imageUrl?: string;
  subId: string;
}

export interface TakeadsOfferPreview {
  id: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  merchantName?: string | null;
  images?: string[] | null;
  imageSource?: string | null;
  offerType: TakeadsOfferType;
  campaignLabel?: string | null;
  placement: string;
  mcomCategoryId?: string | null;
  countryCode: string;
  currency: string;
  price?: number | null;
  visibility: TakeadsVisibility;
  allowedPlanVariantIds: string[];
  termsAndConditions?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isFeatured: boolean;
  destinationUrl: string;
  approvalStatus: TakeadsApprovalStatus;
  publicationStatus: TakeadsPublicationStatus;
  linkResolved: boolean;
  sourceLabel: string;
  affiliateDisclosure: string;
}

export interface TakeadsProductPerformance {
  offerId: string;
  title: string;
  merchantName?: string | null;
  externalMerchantId?: string | null;
  subId?: string | null;
  approvalStatus: TakeadsApprovalStatus;
  publicationStatus: TakeadsPublicationStatus;
  imageUrl?: string | null;
  mcomClicks: number;
  takeadsClicks: number;
  actions: {
    PENDING: number;
    CONFIRMED: number;
    CANCELED: number;
    SETTLED: number;
  };
  validatedRevenue: number;
  pendingRevenue: number;
  currencies: string[];
  revenueByCurrency: Array<{
    currency: string;
    validatedRevenue: number;
    pendingRevenue: number;
  }>;
}

export interface TakeadsProductPerformanceReport {
  period: { from: string; to: string };
  totalOffers: number;
  unmappedActions: number;
  data: TakeadsProductPerformance[];
}

export interface TakeadsMerchantFilters {
  search?: string;
  status?: TakeadsMerchantStatus;
  country?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface TakeadsCouponFilters {
  search?: string;
  approvalStatus?: TakeadsApprovalStatus;
  publicationStatus?: TakeadsPublicationStatus;
  merchantId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface TakeadsOfferFilters {
  search?: string;
  approvalStatus?: TakeadsApprovalStatus;
  publicationStatus?: TakeadsPublicationStatus;
  sourceType?: TakeadsSourceType;
  offerType?: TakeadsOfferType;
  visibility?: TakeadsVisibility;
  merchantId?: string;
  page?: number;
  limit?: number;
}

export interface CreateTakeadsOfferPayload {
  sourceType: TakeadsSourceType;
  externalCouponId?: string;
  externalMerchantId?: string;
  externalProgramId?: string;
  merchantName?: string;
  destinationUrl?: string;
  resolvedTrackingUrl?: string;
  subId?: string;
  price?: number;
  visibility?: TakeadsVisibility;
  allowedPlanVariantIds?: string[];
  title?: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  imageSource?: string;
  mcomSectorId?: string;
  mcomCategoryId?: string;
  mcomSubCategoryId?: string;
  countryCode?: string;
  currency?: string;
  offerType?: TakeadsOfferType;
  campaignLabel?: string;
  placement?: string;
  termsAndConditions?: string;
  startDate?: string;
  endDate?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export type UpdateTakeadsOfferPayload = Partial<
  Omit<
    CreateTakeadsOfferPayload,
    | 'sourceType'
    | 'destinationUrl'
    | 'externalCouponId'
    | 'resolvedTrackingUrl'
    | 'subId'
  >
> & {
  adminDisabled?: boolean;
  reviewNote?: string;
};
