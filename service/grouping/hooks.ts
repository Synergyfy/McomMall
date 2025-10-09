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

export const useInitiateContributionPayment = () => {
  return useMutation({
    mutationFn: (variables: {
      groupId: string;
      data: InitiateContributionPaymentDto;
    }) => initiateContributionPayment(variables.groupId, variables.data),
  });
};

export const useVerifyContributionPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      groupId: string;
      data: VerifyContributionPaymentDto;
    }) => verifyContributionPayment(variables.groupId, variables.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    },
  });
};

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