import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createTerminalConfig,
    getClaimDetails,
    getClaims,
    getGlobalRules,
    getTerminalConfig,
    getTerminalConfigs,
    getTerminalStats,
    updateClaimStatus,
    updateTerminalConfig
} from './api';
import { CreateTerminalConfigDto, GetClaimsParams, UpdateClaimStatusDto, UpdateTerminalConfigDto } from './types';

// Keys
export const terminalKeys = {
    all: ['terminal-cashback'] as const,
    stats: () => [...terminalKeys.all, 'stats'] as const,
    configs: () => [...terminalKeys.all, 'configs'] as const,
    config: (id: string) => [...terminalKeys.configs(), id] as const,
    rules: () => [...terminalKeys.all, 'rules'] as const,
    claims: (params?: GetClaimsParams) => [...terminalKeys.all, 'claims', params] as const,
    claim: (id: string) => [...terminalKeys.all, 'claim', id] as const,
};

// Hooks

export const useGetTerminalStats = () => {
    return useQuery({
        queryKey: terminalKeys.stats(),
        queryFn: getTerminalStats,
    });
};

export const useGetTerminalConfigs = () => {
    return useQuery({
        queryKey: terminalKeys.configs(),
        queryFn: getTerminalConfigs,
    });
};

export const useGetTerminalConfig = (businessId: string) => {
    return useQuery({
        queryKey: terminalKeys.config(businessId),
        queryFn: () => getTerminalConfig(businessId),
        enabled: !!businessId,
    });
};

export const useCreateTerminalConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTerminalConfigDto) => createTerminalConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: terminalKeys.configs() });
        },
    });
};

export const useUpdateTerminalConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ businessId, data }: { businessId: string; data: UpdateTerminalConfigDto }) =>
            updateTerminalConfig(businessId, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: terminalKeys.config(variables.businessId) });
            queryClient.invalidateQueries({ queryKey: terminalKeys.configs() });
        },
    });
};

export const useGetGlobalRules = () => {
    return useQuery({
        queryKey: terminalKeys.rules(),
        queryFn: getGlobalRules,
    });
};

export const useGetTerminalClaims = (params?: GetClaimsParams) => {
    return useQuery({
        queryKey: terminalKeys.claims(params),
        queryFn: () => getClaims(params),
    });
};

export const useGetClaimDetails = (id: string) => {
    return useQuery({
        queryKey: terminalKeys.claim(id),
        queryFn: () => getClaimDetails(id),
        enabled: !!id,
    });
};

export const useUpdateClaimStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClaimStatusDto }) =>
            updateClaimStatus(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: terminalKeys.claim(variables.id) });
            queryClient.invalidateQueries({ queryKey: terminalKeys.claims() });
            queryClient.invalidateQueries({ queryKey: terminalKeys.stats() });
        },
    });
};
