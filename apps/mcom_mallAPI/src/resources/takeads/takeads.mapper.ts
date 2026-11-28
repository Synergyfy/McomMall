import {
  TakeadsActionStatus,
  TakeadsApprovalStatus,
  TakeadsMerchantStatus,
  TakeadsOfferType,
  TakeadsPublicationStatus,
  TakeadsSourceType,
} from './takeads.constants';

export interface RawRecord {
  [key: string]: unknown;
}

export function asString(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function asBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

export function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item));
}

export function asDate(value: unknown): Date | undefined {
  const raw = asString(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function pickRecord(
  source: RawRecord,
  keys: string[],
): Record<string, unknown> | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return undefined;
}

export function firstString(source: RawRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(source[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

export function firstNumber(source: RawRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = asNumber(source[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

export interface MappedMerchant {
  externalMerchantId: string;
  name: string;
  imageUrl?: string;
  defaultDomain?: string;
  domains?: string[];
  description?: string;
  upstreamCategoryId?: string;
  currencyCode?: string;
  countryCodes?: string[];
  isActive: boolean;
  deeplinkAllowed: boolean;
  commissionMetadata?: Record<string, unknown>;
  trackingLink?: string;
  rawPayload: Record<string, unknown>;
  lastSyncedAt: Date;
}

export function mapMerchant(raw: RawRecord): MappedMerchant | null {
  const externalMerchantId = firstString(raw, [
    'merchantId',
    'id',
    'merchant_id',
  ]);
  if (!externalMerchantId) return null;

  const name =
    firstString(raw, ['name', 'merchantName', 'merchant_name']) ||
    `Merchant ${externalMerchantId}`;

  return {
    externalMerchantId,
    name,
    imageUrl: firstString(raw, ['imageUri', 'imageUrl', 'logo']),
    defaultDomain: firstString(raw, ['defaultDomain', 'domain', 'hostname']),
    domains: asStringArray(raw.domains),
    description: firstString(raw, ['description']),
    upstreamCategoryId: firstString(raw, ['categoryId', 'category_id']),
    currencyCode: firstString(raw, ['currencyCode', 'currency']),
    countryCodes: asStringArray(raw.countryCodes),
    isActive: asBoolean(raw.isActive) ?? true,
    deeplinkAllowed: asBoolean(raw.deeplinkAllowed) ?? false,
    commissionMetadata:
      pickRecord(raw, ['commission', 'commissionMetadata', 'payment']) ??
      undefined,
    trackingLink: firstString(raw, ['trackingLink', 'tracking_link']),
    rawPayload: raw,
    lastSyncedAt: new Date(),
  };
}

export interface MappedCoupon {
  externalCouponId: string;
  externalMerchantId?: string;
  name: string;
  code?: string;
  description?: string;
  imageUrl?: string;
  trackingLink?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  languageCodes?: string[];
  countryCodes?: string[];
  upstreamCategoryIds?: string[];
  rawPayload: Record<string, unknown>;
  lastSyncedAt: Date;
}

export function mapCoupon(raw: RawRecord): MappedCoupon | null {
  const externalCouponId = firstString(raw, [
    'couponId',
    'id',
    'coupon_id',
  ]);
  if (!externalCouponId) return null;

  return {
    externalCouponId,
    externalMerchantId: firstString(raw, ['merchantId', 'merchant_id']),
    name:
      firstString(raw, ['name', 'title', 'couponName']) ||
      `Coupon ${externalCouponId}`,
    code: firstString(raw, ['code', 'couponCode']),
    description: firstString(raw, ['description']),
    imageUrl: firstString(raw, ['imageUri', 'imageUrl', 'logo']),
    trackingLink: firstString(raw, ['trackingLink', 'tracking_link']),
    startDate: asDate(raw.startDate),
    endDate: asDate(raw.endDate),
    isActive: asBoolean(raw.isActive) ?? true,
    languageCodes: asStringArray(raw.languageCodes),
    countryCodes: asStringArray(raw.countryCodes),
    upstreamCategoryIds: asStringArray(raw.categoryIds),
    rawPayload: raw,
    lastSyncedAt: new Date(),
  };
}

export function mapActionStatus(value: unknown): TakeadsActionStatus {
  const status = (asString(value) || '').toUpperCase();
  if (status === 'CONFIRMED') return 'CONFIRMED';
  if (status === 'CANCELED' || status === 'CANCELLED') return 'CANCELED';
  if (status === 'SETTLED') return 'SETTLED';
  return 'PENDING';
}

export function mapAction(raw: RawRecord) {
  const actionId = firstString(raw, ['actionId', 'id', 'action_id']);
  if (!actionId) return null;

  return {
    actionId,
    actionNumericId: firstString(raw, ['actionNumericId', 'action_numeric_id']),
    status: mapActionStatus(raw.status),
    type: firstString(raw, ['type']),
    merchantId: firstString(raw, ['merchantId', 'merchant_id']),
    adspaceId: firstString(raw, ['adspaceId', 'adspace_id']),
    programId: firstString(raw, ['programId', 'program_id']),
    couponId: firstString(raw, ['couponId', 'coupon_id']),
    subId: firstString(raw, ['subId', 'sub_id']),
    orderAmount: firstString(raw, ['orderAmount', 'order_amount']),
    publisherRevenue: firstString(raw, [
      'publisherRevenue',
      'publisher_revenue',
    ]),
    currencyCode: firstString(raw, ['currencyCode', 'currency']),
    advertiserPaid: asBoolean(raw.advertiserPaid),
    orderDate: asDate(raw.orderDate),
    clickId: firstString(raw, ['clickId', 'click_id']),
    sourceCreatedAt: asDate(raw.createdAt),
    sourceUpdatedAt: asDate(raw.updatedAt),
    rawPayload: raw,
  };
}

export function mapClickReport(raw: RawRecord) {
  const date = firstString(raw, ['date']);
  if (!date) return null;

  const adspaceId = firstString(raw, ['adspaceId']);
  const merchantId = firstString(raw, ['merchantId']);
  const couponId = firstString(raw, ['couponId']);
  const subId = firstString(raw, ['subId']);

  return {
    reportKey: [date, adspaceId, merchantId, couponId, subId]
      .map((part) => part ?? '')
      .join('|'),
    date,
    adspaceId,
    merchantId,
    merchantName: firstString(raw, ['merchantName']),
    couponId,
    subId,
    count: firstNumber(raw, ['count']) ?? 0,
    sourceUpdatedAt: asDate(raw.updatedAt),
    rawPayload: raw,
  };
}

export function isSafeHttpUrl(value: unknown): value is string {
  const raw = asString(value);
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isApprovalStatus(value: unknown): value is TakeadsApprovalStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected';
}

export function isPublicationStatus(
  value: unknown,
): value is TakeadsPublicationStatus {
  return (
    value === 'unpublished' ||
    value === 'published' ||
    value === 'paused' ||
    value === 'expired' ||
    value === 'withdrawn'
  );
}

export function isMerchantStatus(value: unknown): value is TakeadsMerchantStatus {
  return (
    value === 'not_reviewed' ||
    value === 'accepted' ||
    value === 'rejected' ||
    value === 'inactive'
  );
}

export function isSourceType(value: unknown): value is TakeadsSourceType {
  return value === 'coupon' || value === 'product_url' || value === 'merchant';
}

export function isOfferType(value: unknown): value is TakeadsOfferType {
  return (
    value === 'product' ||
    value === 'service' ||
    value === 'coupon' ||
    value === 'deal'
  );
}
