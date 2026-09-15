import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPlan,
  createPlanPrice,
  deletePlan,
  getPlan,
  getPlans,
  updatePlan,
  updatePlanVariant,
} from './api';
import {
  CreatePlanInput,
  CreatePlanPriceInput,
  UpdatePlanInput,
  UpdatePlanVariantInput,
} from '@/app/admin/types/plan';
import { toast } from 'sonner';

export const useGetPlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });
};

export const useGetPlan = (id: string) => {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => getPlan(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: CreatePlanInput) => createPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan created with Standard, Pro and Pro+ variants');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create plan';
      toast.error(message);
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanInput }) =>
      updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update plan';
      toast.error(message);
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete plan';
      toast.error(message);
    },
  });
};

export const useUpdatePlanVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: UpdatePlanVariantInput;
    }) => updatePlanVariant(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update plan variant';
      toast.error(message);
    },
  });
};

export const useCreatePlanPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: CreatePlanPriceInput;
    }) => createPlanPrice(variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Failed to update price';
      toast.error(message);
    },
  });
};
