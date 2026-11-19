import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { moderationApi } from './api';
import {
  ModerationListParams,
  ModeratedResource,
} from './types';

const moderationKeys = {
  all: ['admin-moderation'] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
  list: (resource: ModeratedResource, params: ModerationListParams) =>
    [...moderationKeys.all, 'list', resource, params] as const,
};

export function useModerationStats() {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: moderationApi.getStats,
  });
}

export function useModeratedItems(
  resource: ModeratedResource,
  params: ModerationListParams,
) {
  return useQuery({
    queryKey: moderationKeys.list(resource, params),
    queryFn: () => moderationApi.list(resource, params),
  });
}

function useModerationMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
      toast.success(successMessage);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Could not update this catalog item.',
      );
    },
  });
}

export function useApproveModeration() {
  return useModerationMutation(
    ({ resource, id, reviewNote }: { resource: ModeratedResource; id: string; reviewNote?: string }) =>
      moderationApi.approve(resource, id, reviewNote),
    'Approved and published.',
  );
}

export function useRejectModeration() {
  return useModerationMutation(
    ({ resource, id, reviewNote }: { resource: ModeratedResource; id: string; reviewNote?: string }) =>
      moderationApi.reject(resource, id, reviewNote),
    'Rejected.',
  );
}

export function useDelistModeration() {
  return useModerationMutation(
    ({ resource, id }: { resource: ModeratedResource; id: string }) =>
      moderationApi.delist(resource, id),
    'Item delisted.',
  );
}

export function useRepublishModeration() {
  return useModerationMutation(
    ({ resource, id }: { resource: ModeratedResource; id: string }) =>
      moderationApi.republish(resource, id),
    'Item republished.',
  );
}
