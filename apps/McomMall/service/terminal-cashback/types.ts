export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';

export enum TerminalLevel {
  VERIFIED_L1 = 1,
  FIXED_L2 = 2,
  ENTERPRISE_L3 = 3,
}

export interface TerminalConfig {
  userId: string;
  userName: string;
  level: TerminalLevel;
  isEnabled: boolean;
  autoApprovalHours: number;
  ranges?: { id: string; minSpend: number; maxSpend: number; rewardValue: number; isActive: boolean }[];
  fixedRewardValue?: number;
  apiEndpoint?: string;
  limits: {
    maxPerDay: number;
    maxPerCustomer: number;
    maxPerReceipt: number;
    monthlyBudget: number;
    maxClaimsPerUser: number;
  };
  updatedAt: string;
}

export interface TerminalClaim {
  id: string;
  userId: string;
  ownerId: string;
  ownerName?: string;
  amount: number;
  spendAmount: number;
  status: ClaimStatus;
  submittedAt: string;
  reviewedAt?: string;
  proofUrl: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    name?: string;
    profilePictureUrl?: string;
  };
}

export interface TerminalClaimDetails extends TerminalClaim {
  meta?: {
    gps?: {
      lat: number;
      lng: number;
    };
    deviceId?: string;
  };
  riskScore?: number;
  flaggedReason?: string;
}

export interface GetClaimsParams {
  ownerId?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface GetClaimsResponse {
  data: TerminalClaim[];
  count: number;
}

export interface CreateTerminalCashbackClaimDto {
  ownerId: string;
  amount: number;
  spendAmount: number;
  proofUrl: string;
  meta: {
    gps?: {
      lat: number;
      lng: number;
    };
    deviceId?: string;
    description?: string;
  };
}

export enum HelpRequestType {
  TERMINAL_CASHBACK_SETUP = 'TERMINAL_CASHBACK_SETUP',
  GENERAL_SUPPORT = 'GENERAL_SUPPORT',
  PRODUCT_CREATION = 'PRODUCT_CREATION',
  PRODUCT_EDIT = 'PRODUCT_EDIT',
  PRODUCT_VARIATION_SETUP = 'PRODUCT_VARIATION_SETUP',
  INVENTORY_MANAGEMENT = 'INVENTORY_MANAGEMENT',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  STORE_DESIGN = 'STORE_DESIGN',
  PROMOTION_SETUP = 'PROMOTION_SETUP',
  CUSTOMER_SERVICE_HELP = 'CUSTOMER_SERVICE_HELP',
}

export interface CreateHelpRequestDto {
  type: HelpRequestType;
  title: string;
  description: string;
}

export interface TerminalCashbackStats {
  pendingCount: number;
  approvedCount: number;
  totalEarned: number;
}

export interface UpdateTerminalCashbackStatusDto {
  status: ClaimStatus;
}