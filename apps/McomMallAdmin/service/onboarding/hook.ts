import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getOnboardingQuestions,
    createOnboardingQuestion,
    updateOnboardingQuestion,
    reorderOnboardingQuestions,
    deleteOnboardingQuestion,
} from './api';
import { CreateOnboardingQuestionDto, UpdateOnboardingQuestionDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetOnboardingQuestions() {
    return useQuery({ queryKey: ['onboarding-questions'], queryFn: getOnboardingQuestions });
}

export function useCreateOnboardingQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateOnboardingQuestionDto) => createOnboardingQuestion(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
            toast.success('Step added');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to add step')),
    });
}

export function useUpdateOnboardingQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateOnboardingQuestionDto }) =>
            updateOnboardingQuestion(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update step')),
    });
}

export function useReorderOnboardingQuestions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => reorderOnboardingQuestions(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to reorder steps')),
    });
}

export function useDeleteOnboardingQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteOnboardingQuestion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
            toast.success('Step removed');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to remove step')),
    });
}
