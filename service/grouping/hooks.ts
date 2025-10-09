import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  initiateGroupContribution,
  payContribution,
} from './api';
import {
  CreateGroupDto,
  Group,
  GroupMember,
  JoinGroupResponse,
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

export const useInitiateGroupContribution = () => {
  return useMutation<JoinGroupResponse, Error, { groupId: string }>({
    mutationFn: ({ groupId }) => initiateGroupContribution(groupId),
  });
};

export const usePayContribution = () => {
  return useMutation<
    GroupMember,
    Error,
    { groupId: string; paymentIntentId: string }
  >({
    mutationFn: ({ groupId, paymentIntentId }) =>
      payContribution(groupId, paymentIntentId),
  });
};