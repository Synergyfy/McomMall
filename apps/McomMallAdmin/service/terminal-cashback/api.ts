import api from '../api';
import {
    CreateTerminalConfigDto,
    GetClaimsParams,
    PaginatedResponse,
    TerminalCashbackClaim,
    TerminalCashbackConfig,
    TerminalGlobalRule,
    UpdateClaimStatusDto,
    UpdateTerminalConfigDto,
    TerminalCashbackStats
} from './types';

// Stats
export const getTerminalStats = async () => {
    const response = await api.get<TerminalCashbackStats>('/terminal-cashback/stats');
    return response.data;
};

// Configs
export const createTerminalConfig = async (data: CreateTerminalConfigDto) => {
    const response = await api.post<TerminalCashbackConfig>('/terminal-cashback/config', data);
    return response.data;
};

export const getTerminalConfigs = async () => {
    const response = await api.get<PaginatedResponse<TerminalCashbackConfig>>('/terminal-cashback/config');
    return response.data;
};

export const getTerminalConfig = async (userId: string) => {
    const response = await api.get<TerminalCashbackConfig>(`/terminal-cashback/config/${userId}`);
    return response.data;
};

export const updateTerminalConfig = async (userId: string, data: UpdateTerminalConfigDto) => {
    const response = await api.patch<TerminalCashbackConfig>(`/terminal-cashback/config/${userId}`, data);
    return response.data;
};

// Global Rules
export const getGlobalRules = async () => {
    const response = await api.get<TerminalGlobalRule[]>('/terminal-cashback/global-rules');
    return response.data;
};

// Claims
export const getClaims = async (params?: GetClaimsParams) => {
    const response = await api.get<PaginatedResponse<TerminalCashbackClaim>>('/terminal-cashback/claims', { params });
    return response.data;
};

export const getClaimDetails = async (id: string) => {
    const response = await api.get<TerminalCashbackClaim>(`/terminal-cashback/claims/${id}`);
    return response.data;
};

export const updateClaimStatus = async (id: string, data: UpdateClaimStatusDto) => {
    const response = await api.patch<TerminalCashbackClaim>(`/terminal-cashback/claims/${id}/status`, data);
    return response.data;
};
