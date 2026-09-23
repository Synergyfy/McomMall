import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getVerifications,
    getVerificationStats,
    approveVerification,
    rejectVerification,
} from './api';
import { ReviewVerificationDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const verificationKeys = {
    all: ['verifications'] as const,
    stats: ['verifications', 'stats'] as const,
};

export function useGetVerifications(filters?: { status?: string; subjectType?: string }) {
    return useQuery({
        queryKey: [...verificationKeys.all, filters ?? {}],
        queryFn: () => getVerifications(filters),
    });
}

export function useGetVerificationStats() {
    return useQuery({ queryKey: verificationKeys.stats, queryFn: getVerificationStats });
}

export function useApproveVerification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: ReviewVerificationDto }) =>
            approveVerification(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: verificationKeys.all });
            queryClient.invalidateQueries({ queryKey: verificationKeys.stats });
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            toast.success('Verification approved');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to approve verification')),
    });
}

export function useRejectVerification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: ReviewVerificationDto }) =>
            rejectVerification(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: verificationKeys.all });
            queryClient.invalidateQueries({ queryKey: verificationKeys.stats });
            toast.success('Verification rejected');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to reject verification')),
    });
}
