import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { campaignCashbackApi, CreateCampaignCashbackDto, CampaignTargetType } from './api';
import { useRouter } from 'next/navigation';

export const useGetCampaignCashbacks = (targetType?: CampaignTargetType) => {
    return useQuery({
        queryKey: ['CAMPAIGN_CASHBACK_LIST', targetType],
        queryFn: () => campaignCashbackApi.findAll(targetType),
    });
};

export const useGetCampaignCashbackById = (id: string) => {
    return useQuery({
        queryKey: ['CAMPAIGN_CASHBACK_DETAIL', id],
        queryFn: () => campaignCashbackApi.findOne(id),
        enabled: !!id,
    });
};

export const useDeleteCampaignCashback = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => campaignCashbackApi.delete(id),
        onSuccess: () => {
            toast.success('Loyalty Cashback template deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['CAMPAIGN_CASHBACK_LIST'] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete campaign';
            toast.error(message);
        }
    });
};

export const useCreateCampaignCashback = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCampaignCashbackDto) => campaignCashbackApi.create(payload),
        onSuccess: () => {
            toast.success('Loyalty Cashback template created successfully!');
            queryClient.invalidateQueries({ queryKey: ['CAMPAIGN_CASHBACK_TEMPLATES'] });
            router.push('/admin/campaign-cashback');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create campaign';
            toast.error(message);
        }
    });
};
