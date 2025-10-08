import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  payContribution,
} from './api';
import { CreateGroupDto, Group, GroupMember } from './types';

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

export const usePayContribution = () => {
  const queryClient = useQueryClient();
  return useMutation<GroupMember, Error, { groupId: string }>({
    mutationFn: ({ groupId }) => payContribution(groupId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
};