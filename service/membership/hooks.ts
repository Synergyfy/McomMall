import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyMembership,
  initiateMembershipPayment,
  verifyMembershipPayment,
} from './api';
import {
  InitiateMembershipPaymentDto,
  Membership,
  VerifyMembershipPaymentDto,
} from './types';

export const useGetMyMembership = () => {
  return useQuery<Membership | null, Error>({
    queryKey: ['my-membership'],
    queryFn: getMyMembership,
  });
};

export const useInitiateMembershipPayment = () => {
  return useMutation<
    { clientSecret?: string; orderId?: string; provider: string },
    Error,
    InitiateMembershipPaymentDto
  >({
    mutationFn: initiateMembershipPayment,
  });
};

export const useVerifyMembershipPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, VerifyMembershipPaymentDto>({
    mutationFn: verifyMembershipPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-membership'] });
    },
  });
};