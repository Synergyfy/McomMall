export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';

export interface TerminalClaim {
  id: string;
  userId: string;
  businessId: string;
  businessName?: string; 
  amount: number;
  spendAmount: number;
  status: ClaimStatus;
  submittedAt: string;
  reviewedAt?: string;
  proofUrl: string;
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
  businessId?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface GetClaimsResponse {
  data: TerminalClaim[];
  count: number;
}

export interface CreateTerminalCashbackClaimDto {
  businessId: string;
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

export interface TerminalCashbackStats {
  pendingCount: number;
  approvedCount: number;
  totalEarned: number;
}

export interface UpdateTerminalCashbackStatusDto {
  status: ClaimStatus;
}
