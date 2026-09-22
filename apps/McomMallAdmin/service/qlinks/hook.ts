import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getQrCodesByBusiness, updateQrCode, deleteQrCode } from './api';
import { UpdateQrCodeDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetQrCodesByBusiness(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? ['qlinks', 'business', businessId] : ['qlinks', 'business', 'none'],
        queryFn: () => getQrCodesByBusiness(businessId as string),
        enabled: !!businessId,
    });
}

export function useUpdateQrCode(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateQrCodeDto }) => updateQrCode(id, dto),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: ['qlinks', 'business', businessId] });
            toast.success('QLink updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update QLink')),
    });
}

export function useDeleteQrCode(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteQrCode(id),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: ['qlinks', 'business', businessId] });
            toast.success('QLink deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete QLink')),
    });
}
