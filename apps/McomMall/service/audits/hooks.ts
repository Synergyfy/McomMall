import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submitAudit, getLatestAudit, getAuditHistory } from './api';
import { Audit, SubmitAuditDto } from './types';

export const useSubmitAudit = () => {
  const queryClient = useQueryClient();
  return useMutation<Audit, Error, SubmitAuditDto>({
    mutationFn: submitAudit,
    onSuccess: (data) => {
      queryClient.setQueryData(['latest-audit', data.businessId], data);
      queryClient.invalidateQueries({ queryKey: ['audit-history', data.businessId] });
    },
  });
};

export const useGetLatestAudit = (businessId?: string) => {
  return useQuery<Audit, Error>({
    queryKey: ['latest-audit', businessId],
    queryFn: () => getLatestAudit(businessId),
  });
};

export const useGetAuditHistory = (businessId?: string) => {
  return useQuery<Audit[], Error>({
    queryKey: ['audit-history', businessId],
    queryFn: () => getAuditHistory(businessId),
  });
};
