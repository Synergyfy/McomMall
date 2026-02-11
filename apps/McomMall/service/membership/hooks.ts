import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  return useMutation<{ clientSecret: string }, Error, CreateMembershipDto>({
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

export const useJoinTrial = () => {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, string>({
    mutationFn: joinTrial,
    onSuccess: (data) => {
      queryClient.setQueryData(['my-membership'], data);
    },
  });
};