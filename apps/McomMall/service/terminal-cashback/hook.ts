import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';
import {
  CreateTerminalCashbackClaimDto,
  GetClaimsParams,
  GetClaimsResponse,
  TerminalCashbackStats,
  TerminalClaimDetails,
  TerminalClaim,
  UpdateTerminalCashbackStatusDto,
  TerminalConfig,
  CreateHelpRequestDto
} from './types';

export const useGetTerminalClaims = (params: GetClaimsParams = {}) => {
  return useQuery({
    queryKey: ['terminal-claims', params],
    queryFn: async () => {
      const { data } = await api.get<GetClaimsResponse>('/terminal-cashback/claims', {
        params,
      });
      return data;
    },
  });
};

export const useGetTerminalClaimDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['terminal-claim-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Claim ID is required');
      const { data } = await api.get<TerminalClaimDetails>(`/terminal-cashback/claims/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTerminalClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTerminalCashbackClaimDto) => {
      const { data } = await api.post<TerminalClaim>('/terminal-cashback/claim', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal-claims'] });
    },
  });
};

export const useGetTerminalStats = () => {
  return useQuery({
    queryKey: ['terminal-cashback-stats'],
    queryFn: async () => {
      const { data } = await api.get<TerminalCashbackStats>('/terminal-cashback/stats');
      return data;
    },
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string } & UpdateTerminalCashbackStatusDto) => {
      const { data } = await api.patch<TerminalClaim>(`/terminal-cashback/claims/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal-claims'] });
      queryClient.invalidateQueries({ queryKey: ['terminal-cashback-stats'] });
      queryClient.invalidateQueries({ queryKey: ['terminal-claim-details'] });
    },
  });
};

export const useGetTerminalConfig = (terminalId?: string) => {
  return useQuery({
    queryKey: ['terminal-config', terminalId],
    queryFn: async () => {
      if (!terminalId) return null;
      try {
        const { data } = await api.get<TerminalConfig>(`/terminal-cashback/config/${terminalId}`);
        return data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!terminalId,
    retry: false,
  });
};

export const useCreateHelpRequest = () => {
  return useMutation({
    mutationFn: async (payload: CreateHelpRequestDto) => {
      const { data } = await api.post('/help-requests', payload);
      return data;
    },
  });
};

export const useUpdateTerminalConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: Partial<TerminalConfig> }) => {
      const response = await api.patch<TerminalConfig>(`/terminal-cashback/config/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminal-config'] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update settings");
    }
  });
};