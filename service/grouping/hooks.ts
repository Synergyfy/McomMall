import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  initiateContributionPayment,
  verifyContributionPayment,
} from './api';
import {
  CreateGroupDto,
  Group,
  GroupMember,
  InitiateContributionPaymentDto,
  VerifyContributionPaymentDto,
} from './types';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, CreateGroupDto>({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
};

export const useGetMyGroups = () => {
  return useQuery<Group[], Error>({
    queryKey: ['my-groups'],
    queryFn: getMyGroups,
  });
};

export const useGetGroupById = (groupId: string) => {
  return useQuery<Group, Error>({
    queryKey: ['group', groupId],
    queryFn: () => getGroupById(groupId),
    enabled: !!groupId,
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<GroupMember, Error, { groupId: string }>({
    mutationFn: ({ groupId }) => joinGroup(groupId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
};

export const useInitiateContributionPayment = () => {
  return useMutation<
    { clientSecret?: string; orderId?: string; provider: string },
    Error,
    { groupId: string; dto: InitiateContributionPaymentDto }
  >({
    mutationFn: ({ groupId, dto }) =>
      initiateContributionPayment(groupId, dto),
  });
};

export const useVerifyContributionPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<
    GroupMember,
    Error,
    { groupId: string; dto: VerifyContributionPaymentDto }
  >({
    mutationFn: ({ groupId, dto }) => verifyContributionPayment(groupId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
};