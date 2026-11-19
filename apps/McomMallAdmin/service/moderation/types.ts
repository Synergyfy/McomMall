export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ModeratedResource =
  | 'products'
  | 'services'
  | 'gift-card-templates'
  | 'voucher-products'
  | 'coupon-products'
  | 'coupons'
  | 'offers'
  | 'time-bonuses';

export interface ModeratedItem {
  id: string;
  name: string;
  description: string | null;
  approvalStatus: ApprovalStatus;
  adminDisabled: boolean;
  itemStatus: string | null;
  ownerId: string | null;
  businessId: string | null;
  businessName: string | null;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
}

export interface ModerationListResponse {
  data: ModeratedItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModerationResourceStats {
  resource: ModeratedResource;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  delisted: number;
}

export interface ModerationStatsResponse {
  resources: ModerationResourceStats[];
  totals: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    delisted: number;
  };
}

export interface ModerationListParams {
  search?: string;
  approvalStatus?: ApprovalStatus;
  delisted?: boolean;
  page?: number;
  limit?: number;
}
