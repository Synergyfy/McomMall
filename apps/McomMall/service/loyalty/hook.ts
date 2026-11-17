import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';

export interface LoyaltyOffer {
  id: string;
  title: string;
  points: number;
  isActive: boolean;
}

export interface LoyaltyStats {
  activeRewards: number;
  pointsIssued: number;
  pointsRedeemed: number;
  redemptionRate: number;
  programGrowth: number;
  memberCount: number;
  completedBookings: number;
  offers: LoyaltyOffer[];
}

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  points: number;
  pointsEarned: number;
  pointsRedeemed: number;
  tier: string | null;
  tierColor: string | null;
  lastActivity: string | null;
}

export interface LoyaltyTierCount {
  name: string;
  minPoints: number;
  color?: string;
  count: number;
}

export interface LoyaltyMembersResponse {
  members: LoyaltyMember[];
  tierCounts: LoyaltyTierCount[];
  total: number;
  expiringPoints: number;
}

export interface LoyaltyTransaction {
  id: string;
  points: number;
  type: 'EARNED' | 'REDEMPTION';
  reason?: string | null;
  source?: string | null;
  created_at: string;
  user?: { id: string; fullName?: string; firstName?: string; lastName?: string; email?: string };
  promotion?: { id: string; name: string } | null;
  offer?: { id: string; name: string } | null;
}

export interface LoyaltyCustomer {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  points: number;
  tier: string | null;
  tierColor: string | null;
  pointTransactions: LoyaltyTransaction[];
  claimableRewards: { id: string; title: string; description: string; points: number }[];
  redeemedRewards: { id: string; points: number; createdAt: string }[];
  earnOffers: {
    id: string;
    title: string;
    description: string;
    ruleType: string;
    trigger?: string;
    pointsPerCurrency?: number;
    fixedPoints?: number;
    multiplier?: number;
  }[];
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  color?: string;
}

export interface LoyaltySettings {
  id: string;
  businessId: string;
  isEnabled: boolean;
  pointsPerCurrency?: number | null;
  pointsMultiplier?: number | null;
  signupBonusPoints?: number | null;
  redemptionApproval: string;
  terms?: string | null;
  programName?: string | null;
  brandColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  tierConfig?: LoyaltyTier[] | null;
  redemptionMode?: string | null;
  redemptionValue?: string | number | null;
}

export interface LoyaltyRule {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  ruleType: string;
  trigger: string;
  targetSegment?: string | null;
  frequencyLimit?: number | null;
  minSpend?: string | number | null;
  pointsPerCurrency?: number | null;
  fixedPoints?: number | null;
  multiplier?: number | null;
  appliesTo?: string | null;
  isActive: boolean;
  created_at: string;
}

const withBusiness = (path: string, businessId: string) =>
  `${path}${path.includes('?') ? '&' : '?'}businessId=${businessId}`;

export interface LoyaltyEarningConfig {
  id?: string;
  businessId: string;
  isActive: boolean;
  earnOnProducts: boolean;
  earnOnServices: boolean;
  pointsPerCurrency: number;
  fixedPointsPerOrder: number;
  minSpend?: number | string | null;
  includedProductIds: string[];
  excludedProductIds: string[];
  includedServiceIds: string[];
  excludedServiceIds: string[];
  productPointOverrides: Record<string, number>;
  servicePointOverrides: Record<string, number>;
}

export interface PublicLoyaltyProgram {
  businessId: string;
  programName: string;
  isOwner: boolean;
  isConfigured: boolean;
  isEnabled: boolean;
  pointsPerCurrency: number;
  fixedPointsPerOrder: number;
  earnOnProducts: boolean;
  earnOnServices: boolean;
  minSpend?: number | string | null;
  isJoined: boolean;
  memberCount: number;
}

export const useLoyaltyStats = (businessId?: string) =>
  useQuery<LoyaltyStats>({
    queryKey: ['loyalty', 'stats', businessId],
    queryFn: async () => {
      const { data } = await api.get(withBusiness('/loyalty/stats', businessId!));
      return data;
    },
    enabled: !!businessId,
  });

export const useLoyaltyMembers = (
  businessId?: string,
  options: { search?: string; limit?: number; offset?: number } = {}
) =>
  useQuery<LoyaltyMembersResponse>({
    queryKey: ['loyalty', 'members', businessId, options],
    queryFn: async () => {
      const { data } = await api.get(withBusiness('/loyalty/members', businessId!), {
        params: options,
      });
      return data;
    },
    enabled: !!businessId,
  });

export const useLoyaltyTransactions = (
  businessId?: string,
  options: { page?: number; limit?: number; type?: string } = {}
) =>
  useQuery<{ data: LoyaltyTransaction[]; meta: any }>({
    queryKey: ['loyalty', 'transactions', businessId, options],
    queryFn: async () => {
      const { data } = await api.get(
        withBusiness('/loyalty/transactions', businessId!),
        { params: options }
      );
      return data;
    },
    enabled: !!businessId,
  });

export const useLoyaltyCustomer = (businessId?: string, customerId?: string) =>
  useQuery<LoyaltyCustomer>({
    queryKey: ['loyalty', 'customer', businessId, customerId],
    queryFn: async () => {
      const { data } = await api.get(
        withBusiness(`/loyalty/customer/${customerId}`, businessId!)
      );
      return data;
    },
    enabled: !!businessId && !!customerId,
  });

export const useLoyaltyRules = (businessId?: string) =>
  useQuery<LoyaltyRule[]>({
    queryKey: ['loyalty', 'rules', businessId],
    queryFn: async () => {
      const { data } = await api.get(withBusiness('/loyalty/rules', businessId!));
      return data;
    },
    enabled: !!businessId,
  });

export const useCreateLoyaltyRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/loyalty/rules', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'rules'] });
    },
  });
};

export const useUpdateLoyaltyRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/loyalty/rules/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'rules'] });
    },
  });
};

export const useDeleteLoyaltyRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/loyalty/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'rules'] });
    },
  });
};

export const useAllocatePoints = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      businessId: string;
      customerId?: string;
      customerIds?: string[];
      points: number;
      reason?: string;
    }) => {
      if (payload.customerIds && payload.customerIds.length > 0) {
        const { data } = await api.post('/loyalty/points/allocate-bulk', payload);
        return data;
      }
      const { data } = await api.post('/loyalty/points/allocate', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useLoyaltyEarningConfig = (businessId?: string) =>
  useQuery<LoyaltyEarningConfig>({
    queryKey: ['loyalty', 'earning-config', businessId],
    queryFn: async () => {
      const { data } = await api.get(
        withBusiness('/loyalty/earning-config', businessId!)
      );
      return data;
    },
    enabled: !!businessId,
  });

export const useUpdateLoyaltyEarningConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      ...payload
    }: { businessId: string } & Partial<LoyaltyEarningConfig>) => {
      const { data } = await api.put(
        withBusiness('/loyalty/earning-config', businessId),
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'earning-config'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });
};

export const usePublicLoyaltyProgram = (businessId?: string, enabled = true) =>
  useQuery<PublicLoyaltyProgram>({
    queryKey: ['loyalty', 'public-program', businessId],
    queryFn: async () => {
      const { data } = await api.get(`/loyalty/public/program/${businessId}`);
      return data;
    },
    enabled: !!businessId && enabled,
  });

export const useJoinLoyaltyProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (businessId: string) => {
      const { data } = await api.post('/loyalty/join', { businessId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'public-program'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });
};
