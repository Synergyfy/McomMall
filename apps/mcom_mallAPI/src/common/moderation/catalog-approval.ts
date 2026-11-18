/**
 * Moderation state shared by every merchant-authored catalog item that is
 * exposed to shoppers (products, services, gift-card templates, voucher
 * products, coupon products, coupons, loyalty offers and time bonuses).
 *
 * `approvalStatus` answers "has an admin signed this off?" while
 * `adminDisabled` answers "has an admin delisted it afterwards?". A shopper may
 * only see an item when it is APPROVED, not delisted, and still in whatever
 * merchant-controlled published/active state the item uses.
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/** Fields only an admin may write. Stripped from every merchant payload. */
export const MODERATION_FIELDS = [
  'approvalStatus',
  'reviewNote',
  'reviewedBy',
  'reviewedAt',
  'adminDisabled',
] as const;

export type ModerationField = (typeof MODERATION_FIELDS)[number];

/**
 * Removes admin-only moderation fields from a merchant-supplied payload.
 * Mutates and returns the payload so callers can keep their existing
 * destructuring style.
 */
export function stripModerationFields<T extends Record<string, any>>(
  payload: T,
): T {
  for (const field of MODERATION_FIELDS) {
    delete payload[field];
  }
  return payload;
}

export interface ApprovalReviewFields {
  approvalStatus: ApprovalStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
}

/** Shape used when an owner edits a previously rejected item. */
export function resubmitForApproval<
  T extends Partial<ApprovalReviewFields> & { approvalStatus?: ApprovalStatus },
>(entity: T): T {
  entity.approvalStatus = ApprovalStatus.PENDING;
  entity.reviewNote = null;
  entity.reviewedBy = null;
  entity.reviewedAt = null;
  return entity;
}
