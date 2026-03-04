import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CampaignCashbackResponse, CampaignCashback, CampaignTargetType } from './types';

export const useGetCampaignCashbacks = (params: { targetType?: CampaignTargetType; page?: number; limit?: number } = {}) => {
    return useQuery({
        queryKey: ['campaign-cashbacks', params],
        queryFn: async () => {
            const { data } = await api.get<any[]>('/campaign-cashback', { params });

            // Flatten UserCampaignCashback into the structure the UI expects
            const flattened = data.map(uc => ({
                ...uc.campaign, // Spread template properties (name, totalValue, expiryDate, etc)
                id: uc.id, // Use the instance ID
                templateId: uc.campaign.id,
                status: uc.status,
                contributionPaid: uc.contributionPaid,
                wallets: uc.wallets,
                activationTimerDate: uc.activationTimerDate
            }));

            return {
                data: flattened,
                total: flattened.length,
                page: params.page || 1,
                limit: params.limit || 10
            } as CampaignCashbackResponse;
        },
    });
};

export const useGetCampaignCashbackById = (id: string) => {
    return useQuery({
        queryKey: ['campaign-cashback', id],
        queryFn: async () => {
            const { data: uc } = await api.get<any>(`/campaign-cashback/${id}`);
            return {
                ...uc.campaign,
                id: uc.id,
                templateId: uc.campaign.id,
                status: uc.status,
                contributionPaid: uc.contributionPaid,
                wallets: uc.wallets,
                activationTimerDate: uc.activationTimerDate
            } as CampaignCashback;
        },
        enabled: !!id,
    });
};

export const useContributeToCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ campaignId, ...body }: { campaignId: string; amount: number; paymentMethod: string; transactionId?: string }) => {
            const { data } = await api.post(`/campaign-cashback/${campaignId}/contribute`, body);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['campaign-cashbacks'] });
            queryClient.invalidateQueries({ queryKey: ['campaign-cashback', variables.campaignId] });
        },
    });
};
