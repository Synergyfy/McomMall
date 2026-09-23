import useSWR, { useSWRConfig } from 'swr';
import api from '../api';
import { CreateRewardDefinitionDto, RewardDefinition, MoneyEngineAnalytics, AdminVoucherPage } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useGetAdminVouchers = (page: number = 1, limit: number = 50) => {
    const token = useSelector((state: RootState) => state.auth.accessToken);
    const { data, error, mutate } = useSWR<AdminVoucherPage>(
        token ? `/money-engine/admin/vouchers?page=${page}&limit=${limit}` : null,
        fetcher
    );

    return {
        vouchers: data?.data ?? [],
        total: data?.count ?? 0,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
};

export const useGetRewardDefinitions = () => {
    const token = useSelector((state: RootState) => state.auth.accessToken);
    const { data, error, mutate } = useSWR<any>(
        token ? '/money-engine/admin/definitions' : null,
        fetcher
    );

    const definitions = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

    return {
        definitions,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
};

export const useGetMoneyEngineAnalytics = () => {
    const token = useSelector((state: RootState) => state.auth.accessToken);
    const { data: response, error, mutate } = useSWR<any>(
        token ? '/money-engine/admin/analytics' : null,
        (url: string) => api.get(url).then(res => res.data)
    );

    const analytics = response?.data || response;

    return {
        analytics,
        isLoading: !error && !response,
        isError: error,
        mutate,
    };
};

export const useCreateRewardDefinition = () => {
    const { mutate } = useSWRConfig();

    const createDefinition = async (data: CreateRewardDefinitionDto) => {
        const response = await api.post('/money-engine/definitions', data);
        mutate('/money-engine/admin/definitions');
        return response.data;
    };

    return createDefinition;
};

export const useDeleteRewardDefinition = () => {
    const { mutate } = useSWRConfig();

    const deleteDefinition = async (id: string) => {
        const response = await api.delete(`/money-engine/definitions/${id}`);
        mutate('/money-engine/admin/definitions');
        return response.data;
    };

    return deleteDefinition;
};
