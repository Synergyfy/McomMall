import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  getMyMembership,
  initiateMembershipPayment,
  verifyMembershipPayment,
  joinTrial,
} from './api';
import {
  CreateMembershipDto,
  Membership,
  VerifyPaymentDto,
} from './types';

export const useGetMyMembership = () => {
  return useQuery<Membership | null, Error>({
    queryKey: ['my-membership'],
    queryFn: getMyMembership,
  });
};

export const useInitiateMembershipPayment = () => {
  return useMutation<
    {
      clientSecret?: string;
      orderId?: string;
      approvalUrl?: string;
      transactionId?: string;
      holdId?: string;
      expiresAt?: string;
      provider?: string;
    },
    Error,
    CreateMembershipDto
  >({
    mutationFn: initiateMembershipPayment,
  });
};

export const useVerifyMembershipPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, VerifyPaymentDto>({
    mutationFn: verifyMembershipPayment,
    onSuccess: (data) => {
      queryClient.setQueryData(['my-membership'], data);
    },
  });
};

export interface RenewalState {
  membershipId: string;
  autoRenew: boolean;
  renewalStatus: 'active' | 'past_due' | 'canceled';
  nextChargeAt: string | null;
  renewalAttempts: number;
  lastRenewalAt: string | null;
  renewalAmount: number | null;
  renewalCurrency: string;
  renewalMethod: string;
  currentPeriodEnd: string | null;
  planName: string | null;
}

export const useGetRenewal = () => {
  return useQuery<RenewalState | null, Error>({
    queryKey: ['membership-renewal'],
    queryFn: async () => {
      const { data } = await api.get('/membership/renewal');
      return data ?? null;
    },
  });
};

export const useUpdateRenewal = () => {
  const queryClient = useQueryClient();
  return useMutation<RenewalState | null, Error, boolean>({
    mutationFn: async (autoRenew) => {
      const { data } = await api.patch('/membership/renewal', { autoRenew });
      return data ?? null;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['membership-renewal'], data);
      queryClient.invalidateQueries({ queryKey: ['my-membership'] });
    },
  });
};

export const useJoinTrial = () => {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, string>({
    mutationFn: joinTrial,
    onSuccess: (data) => {
      queryClient.setQueryData(['my-membership'], data);
    },
  });
};