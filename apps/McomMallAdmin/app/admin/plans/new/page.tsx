'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { PlanWizard } from '../components/PlanWizard';
import {
  PlanFormValues,
  valuesToCreateInput,
} from '../components/plan-schema';
import { useCreatePlan } from '@/service/plans/hook';

export default function NewPlanPage() {
  const router = useRouter();
  const createPlanMutation = useCreatePlan();

  const handleSubmit = async (values: PlanFormValues) => {
    await createPlanMutation.mutateAsync(valuesToCreateInput(values));
    router.push('/admin/plans');
  };

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
            <Plus className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create Plan
            </h1>
            <p className="text-slate-500">
              One plan creates Standard (90 days), Pro (180 days) and Pro+
              (1 year) — price and configure each side by side.
            </p>
          </div>
        </div>
      </div>

      <PlanWizard
        onSubmit={handleSubmit}
        isSubmitting={createPlanMutation.isPending}
        submitLabel="Create Plan"
      />
    </div>
  );
}
