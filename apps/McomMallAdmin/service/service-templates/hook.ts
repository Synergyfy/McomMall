import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getServiceTemplates,
    createServiceTemplate,
    updateServiceTemplate,
    deleteServiceTemplate,
} from './api';
import { CreateServiceTemplateDto, UpdateServiceTemplateDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetServiceTemplates(search?: string) {
    return useQuery({
        queryKey: ['service-templates', search ?? ''],
        queryFn: () => getServiceTemplates(search),
    });
}

export function useCreateServiceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateServiceTemplateDto) => createServiceTemplate(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-templates'] });
            toast.success('Template saved');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to save template')),
    });
}

export function useUpdateServiceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateServiceTemplateDto }) =>
            updateServiceTemplate(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-templates'] });
            toast.success('Template updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update template')),
    });
}

export function useDeleteServiceTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteServiceTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-templates'] });
            toast.success('Template deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete template')),
    });
}
