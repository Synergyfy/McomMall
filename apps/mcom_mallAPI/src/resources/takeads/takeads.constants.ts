export const TAKEADS_PROVIDER = 'takeads';

export const TAKEADS_APPROVAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const;
export type TakeadsApprovalStatus =
  (typeof TAKEADS_APPROVAL_STATUSES)[number];

export const TAKEADS_PUBLICATION_STATUSES = [
  'unpublished',
  'published',
  'paused',
  'expired',
  'withdrawn',
] as const;
export type TakeadsPublicationStatus =
  (typeof TAKEADS_PUBLICATION_STATUSES)[number];

export const TAKEADS_MERCHANT_STATUSES = [
  'not_reviewed',
  'accepted',
  'rejected',
  'inactive',
] as const;
export type TakeadsMerchantStatus =
  (typeof TAKEADS_MERCHANT_STATUSES)[number];

export const TAKEADS_SOURCE_TYPES = [
  'coupon',
  'product_url',
  'merchant',
] as const;
export type TakeadsSourceType = (typeof TAKEADS_SOURCE_TYPES)[number];

/**
 * `public` offers appear on the storefront /deals page. `plan_only` offers are
 * only returned to signed-in businesses whose effective plan variant is in
 * the offer's allowed list.
 */
export const TAKEADS_VISIBILITIES = ['public', 'plan_only'] as const;
export type TakeadsVisibility = (typeof TAKEADS_VISIBILITIES)[number];

export const TAKEADS_CURRENCIES = ['GBP'] as const;
export type TakeadsCurrency = (typeof TAKEADS_CURRENCIES)[number];

export const TAKEADS_OFFER_TYPES = [
  'product',
  'service',
  'coupon',
  'deal',
] as const;
export type TakeadsOfferType = (typeof TAKEADS_OFFER_TYPES)[number];

export const TAKEADS_SYNC_TYPES = [
  'merchants',
  'coupons',
  'reports',
  'all',
] as const;
export type TakeadsSyncType = (typeof TAKEADS_SYNC_TYPES)[number];

export const TAKEADS_ACTION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELED',
  'SETTLED',
] as const;
export type TakeadsActionStatus = (typeof TAKEADS_ACTION_STATUSES)[number];

export const TAKEADS_SUBID_PREFIX = 'mm_';
export const TAKEADS_SUBID_MAX_LENGTH = 30;

/**
 * Shared publication gate. Audience is deliberately omitted here so public
 * and plan-only queries can add their own visibility rule.
 */
const TAKEADS_BASE_PUBLISHABLE_SQL = `
  offer."approvalStatus" = 'approved'
  AND offer."publicationStatus" = 'published'
  AND offer."adminDisabled" = false
  AND offer."upstreamActive" = true
  AND (offer."startDate" IS NULL OR offer."startDate" <= NOW())
  AND (offer."endDate" IS NULL OR offer."endDate" >= NOW())
  AND offer."resolvedTrackingUrl" IS NOT NULL
`;

/**
 * Only approved + published + upstream-active + in-date public offers with a
 * resolved tracking link may be shown on the storefront. Plan-only offers are
 * excluded here and can only be reached through the authenticated business
 * endpoints.
 */
export const TAKEADS_PUBLISHABLE_SQL = `(
  ${TAKEADS_BASE_PUBLISHABLE_SQL}
  AND offer."visibility" = 'public'
)`;

/** Same publication gate, restricted to business-only plan offers. */
export const TAKEADS_PLAN_ONLY_PUBLISHABLE_SQL = `(
  ${TAKEADS_BASE_PUBLISHABLE_SQL}
  AND offer."visibility" = 'plan_only'
)`;

export const TAKEADS_SOURCE_LABELS: Record<string, string> = {
  local_business: 'Local Business',
  national_brand: 'National Brand',
  affiliate_offer: 'Affiliate Offer',
  coupon_deal: 'Coupon / Deal',
  partner_offer: 'Partner Offer',
};

export const TAKEADS_AFFILIATE_DISCLOSURE =
  'MCOM Mall may earn a commission if you make a qualifying purchase through ' +
  'this link. Your purchase is completed with the external merchant and is ' +
  'subject to that merchant\u2019s terms.';
