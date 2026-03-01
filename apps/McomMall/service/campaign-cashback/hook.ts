import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CampaignCashbackResponse, CampaignCashback, CampaignTargetType, CampaignDisplayType, CampaignUnlockMode } from './types';

export const useGetCampaignCashbacks = (params: { targetType?: CampaignTargetType; page?: number; limit?: number } = {}) => {
    return useQuery({
        queryKey: ['campaign-cashbacks', params],
        queryFn: async () => {
            // Mocking for now since backend is not ready
            // const { data } = await api.get<CampaignCashbackResponse>('/campaign-cashback', { params });
            // return data;

            // MOCK DATA for frontend development
            const mockData: CampaignCashbackResponse = {
                data: [
                    {
                        id: 'cam-1',
                        name: 'Summer £30 Booster (Voucher)',
                        targetType: CampaignTargetType.B2C,
                        displayType: CampaignDisplayType.VOUCHER,
                        totalValue: 30,
                        levelValue: 10,
                        unlockMode: CampaignUnlockMode.REQUIRE_FULL_UNLOCK,
                        contributionRequired: true,
                        contributionPaid: false,
                        externalCampaign: false,
                        expiryDate: '2026-12-31T23:59:59Z',
                        activationTimerDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
                        activationTasks: ['Complete profile verification', 'Invite 2 friends'],
                        status: 'ACTIVE' as any,
                        wallets: [
                            { channelType: 'HYPERLOCAL' as any, value1Balance: 5, value2Balance: 0, value3Balance: 0 },
                            { channelType: 'NEARBY' as any, value1Balance: 5, value2Balance: 0, value3Balance: 0 },
                            { channelType: 'ONLINE' as any, value1Balance: 0, value2Balance: 10, value3Balance: 10 }
                        ],
                        value1Title: '247GBS Preloaded',
                        value1Description: 'Courtesy of 247GBS to start you off.',
                        value1UsageText: 'Valid locally.',
                        value2Title: 'MCOM System Preloaded',
                        value2Description: 'Platform-backed additional funds.',
                        value2UsageText: 'Online only.',
                        value3Title: 'Your Contribution',
                        value3Description: 'Your required top-up to unlock everything.',
                        value3UsageText: 'Valid anywhere.'
                    },
                    {
                        id: 'cam-2',
                        name: 'Premium Member £60 Reward (E-Card)',
                        targetType: CampaignTargetType.B2C,
                        displayType: CampaignDisplayType.E_CARD,
                        totalValue: 60,
                        levelValue: 20,
                        unlockMode: CampaignUnlockMode.ALLOW_PRELOADED_USAGE,
                        contributionRequired: true,
                        contributionPaid: true,
                        externalCampaign: true,
                        externalRedemptionUrl: 'https://example.com/redeem',
                        expiryDate: '2027-01-15T00:00:00Z',
                        status: 'ACTIVE' as any,
                        wallets: [
                            { channelType: 'ONLINE' as any, value1Balance: 20, value2Balance: 20, value3Balance: 20 }
                        ],
                        value1Title: '247GBS Preloaded',
                        value1Description: 'A premium start to your reward.',
                        value1UsageText: 'Digital only.',
                        value2Title: 'Partner Preloaded',
                        value2Description: 'Additional credit from partners.',
                        value2UsageText: 'Digital only.',
                        value3Title: 'Your Contribution',
                        value3Description: 'You already paid this!',
                        value3UsageText: 'Digital only.'
                    }
                ],
                total: 2,
                page: params.page || 1,
                limit: params.limit || 10,
            };
            return mockData;
        },
    });
};

export const useGetCampaignCashbackById = (id: string) => {
    return useQuery({
        queryKey: ['campaign-cashback', id],
        queryFn: async () => {
            // const { data } = await api.get<CampaignCashback>(`/campaign-cashback/${id}`);
            // return data;
            return null as any; // Mock
        },
        enabled: !!id,
    });
};

export const useContributeToCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { campaignId: string; amount: number; paymentMethod: string }) => {
            // const { data } = await api.post(`/campaign-cashback/${payload.campaignId}/contribute`, payload);
            // return data;

            // Mock delay
            return new Promise((resolve) => setTimeout(resolve, 1500));
        },
        onSuccess: (_, variables) => {
            // Invalidate queries to refresh data after contribution
            queryClient.invalidateQueries({ queryKey: ['campaign-cashbacks'] });
            queryClient.invalidateQueries({ queryKey: ['campaign-cashback', variables.campaignId] });
        },
    });
};
