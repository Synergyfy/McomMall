import api from '../api';
import {
  CreatePlanInput,
  CreatePlanPriceInput,
  Plan,
  PlanPrice,
  PlanVariant,
  UpdatePlanInput,
  UpdatePlanVariantInput,
} from '@/app/admin/types/plan';

export const getPlans = async (): Promise<Plan[]> => {
  const { data } = await api.get('/plans');
  return data;
};

export const getPlan = async (id: string): Promise<Plan> => {
  const { data } = await api.get(`/plans/${id}`);
  return data;
};

export const createPlan = async (plan: CreatePlanInput): Promise<Plan> => {
  const { data } = await api.post('/plans', plan);
  return data;
};

export const updatePlan = async (
  id: string,
  plan: UpdatePlanInput,
): Promise<Plan> => {
  const { data } = await api.patch(`/plans/${id}`, plan);
  return data;
};

export const deletePlan = async (id: string): Promise<void> => {
  await api.delete(`/plans/${id}`);
};

export const updatePlanVariant = async (
  variantId: string,
  variant: UpdatePlanVariantInput,
): Promise<PlanVariant> => {
  const { data } = await api.patch(`/plans/variants/${variantId}`, variant);
  return data;
};

export const createPlanPrice = async (
  variantId: string,
  price: CreatePlanPriceInput,
): Promise<PlanPrice> => {
  const { data } = await api.post(
    `/plans/variants/${variantId}/prices`,
    price,
  );
  return data;
};
