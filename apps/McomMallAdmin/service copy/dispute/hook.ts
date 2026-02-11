import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
    Dispute,
    DisputeStats,
    GetDisputesParams,
    GetDisputesResponse,
    AdminDashboardResponse
} from './types';
import { toast } from 'sonner';

const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
    const { data } = await api.get('/admin/dashboard');
    return data;
};

// --- API Functions ---

const getDisputeStats = async (): Promise<DisputeStats> => {
    const { data } = await api.get('/dispute/admin/stats');
    return data;
};

const getAllDisputes = async (params: GetDisputesParams): Promise<GetDisputesResponse> => {
    const { data } = await api.get('/dispute/admin/list', { params });
    return data;
};

const resolveDispute = async (id: string): Promise<void> => {
    await api.put(`/dispute/resolve/${id}`); // Assuming this endpoint based on logic or provided info
};

// --- Hooks ---

export const useGetDisputeStats = () => {
    return useQuery({
        queryKey: ['dispute-stats'],
        queryFn: getDisputeStats,
    });
};

export const useGetAllDisputes = (params: GetDisputesParams) => {
    return useQuery({
        queryKey: ['disputes', params],
        queryFn: () => getAllDisputes(params),
    });
};

export const useResolveDispute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: resolveDispute,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            queryClient.invalidateQueries({ queryKey: ['dispute-stats'] });
            toast.success('Dispute resolved successfully');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to resolve dispute';
            toast.error(errorMessage);
        },
    });
};
export const useGetAdminDashboard = () => {
    return useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: getAdminDashboard,
    });
};
