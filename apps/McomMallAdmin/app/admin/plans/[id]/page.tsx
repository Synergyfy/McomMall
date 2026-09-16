'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PlanWizard } from '../components/PlanWizard';
import {
  PlanFormValues,
  valuesToUpdateCalls,
} from '../components/plan-schema';
import {
  useCreatePlanPrice,
  useGetPlan,
  useUpdatePlan,
  useUpdatePlanVariant,
} from '@/service/plans/hook';

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: plan, isLoading } = useGetPlan(planId ?? '');
  const updatePlanMutation = useUpdatePlan();
  const updateVariantMutation = useUpdatePlanVariant();
  const createPriceMutation = useCreatePlanPrice();

  const handleSubmit = async (values: PlanFormValues) => {
    if (!plan) return;
    const { planData, variantCalls } = valuesToUpdateCalls(plan, values);

    await updatePlanMutation.mutateAsync({ id: plan.id, data: planData });

    for (const call of variantCalls) {
      await updateVariantMutation.mutateAsync({
        variantId: call.variantId,
        data: call.data,
      });
      if (call.priceData) {
        await createPriceMutation.mutateAsync({
          variantId: call.variantId,
          data: call.priceData,
        });
      }
    }

    router.push('/admin/plans');
  };

  const isSubmitting =
    updatePlanMutation.isPending ||
    updateVariantMutation.isPending ||
    createPriceMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-96 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-lg font-extrabold text-slate-900">Plan not found</p>
        <p className="mt-1 text-sm text-slate-500">
          It may have been deleted.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/admin/plans">Back to Plans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" className="w-fit gap-2 px-0 text-slate-500 hover:text-slate-900">
          <Link href="/admin/plans">
            <ArrowLeft className="h-4 w-4" /> Back to Plans
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
            <Pencil className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {plan.name}
            </h1>
            <p className="text-slate-500">
              Update pricing, quotas and features across Standard, Pro and
              Pro+.
            </p>
          </div>
        </div>
      </div>

      <PlanWizard
        initialData={plan}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Plan"
      />
    </div>
  );
}
