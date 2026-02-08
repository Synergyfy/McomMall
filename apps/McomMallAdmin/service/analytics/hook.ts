import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { AdminAnalytics } from './types';

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

// Fetch Admin Analytics
export const useGetAdminAnalytics = (range: string = '7days') => {
    return useQuery({
        queryKey: ['FETCH_ADMIN_ANALYTICS', range],
        queryFn: async () => {
            try {
                const response = await api.get<AdminAnalytics>('/admin/analytics', {
                    params: { range },
                });
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to fetch analytics');
            }
        },
    });
};
