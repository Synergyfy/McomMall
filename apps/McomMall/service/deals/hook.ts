import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { DealsResponse, GetDealsParams } from './types';

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export const useGetMyDeals = (params: GetDealsParams = { page: 1, limit: 10 }) => {
    const fetch = async (): Promise<DealsResponse> => {
        try {
            const response = await api.get('/deals/mine', {
                params,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            throw new Error(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch my deals'
            );
        }
    };

    return useQuery({
        queryFn: fetch,
        queryKey: ['FETCH_MY_DEALS', params.page, params.limit],
    });
};
