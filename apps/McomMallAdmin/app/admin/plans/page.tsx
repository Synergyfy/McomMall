'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useGetPlans, useDeletePlan } from '@/service/plans/hook';
import {
  Plan,
  PlanTier,
  getActivePrice,
  getPriceAmount,
  getTierLabel,
  getVariantDurationLabel,
} from '@/app/admin/types/plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { TIER_THEME } from './components/plan-theme';

const TIER_ORDER = [PlanTier.STANDARD, PlanTier.PRO, PlanTier.PRO_PLUS];

function LoadingSkeletons() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <div className="h-28 animate-pulse bg-slate-200" />
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onManage,
  onDelete,
}: {
  plan: Plan;
  onManage: () => void;
  onDelete: () => void;
}) {
  const activeVariants =
    plan.variants?.filter((variant) => variant.isActive).length ?? 0;

  return (
    <Card className="group flex flex-col overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 pb-5 pt-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {plan.slug}
            </p>
            <h2 className="truncate text-2xl font-extrabold text-white">
              {plan.name}
            </h2>
            <p className="mt-1 line-clamp-1 text-sm text-slate-300">
              {plan.description || 'No description'}
            </p>
          </div>
          {plan.isActive ? (
            <Badge className="shrink-0 border-emerald-300/30 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/15">
              Active
            </Badge>
          ) : (
            <Badge className="shrink-0 border-slate-400/30 bg-slate-400/15 text-slate-300 hover:bg-slate-400/15">
              Inactive
            </Badge>
          )}
        </div>
        <p className="relative mt-3 text-xs font-semibold text-slate-400">
          {activeVariants} of {plan.variants?.length ?? 0} variants selling
        </p>
      </div>

      <CardContent className="flex-1 space-y-2.5 p-4">
        {TIER_ORDER.map((tier) => {
          const theme = TIER_THEME[tier];
          const Icon = theme.icon;
          const variant = plan.variants?.find(
            (item) => item.tierLevel?.name === tier,
          );
          const price = variant ? getActivePrice(variant) : null;
          const selling = variant?.isActive ?? false;
          return (
            <div
              key={tier}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
                selling
                  ? cn('bg-white', theme.border)
                  : 'border-slate-100 bg-slate-50 opacity-60',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white',
                  selling ? cn('bg-gradient-to-br', theme.banner) : 'bg-slate-300',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900 leading-tight">
                  {getTierLabel(tier)}
                  {!selling && (
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                      Paused
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {variant ? getVariantDurationLabel(variant) : 'Not configured'}
                  {' · '}one-off
                </p>
              </div>
              <p className="text-lg font-black text-slate-900">
                £{getPriceAmount(price).toFixed(2)}
              </p>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t bg-slate-50/60 px-4 py-3">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onManage}
            title="Manage plan"
            className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete plan"
            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm border border-transparent hover:border-red-100 transition-all"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onManage}
          className="text-xs font-bold h-9 px-4 rounded-lg bg-white shadow-sm border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
        >
          Manage Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

function PlansContent() {
  const router = useRouter();
  const { data: plans, isLoading } = useGetPlans();
  const deletePlanMutation = useDeletePlan();

  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await deletePlanMutation.mutateAsync(planToDelete);
      setPlanToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeletons />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
            <Layers className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Plans{' '}
              <span className="text-base font-bold text-slate-400">
                {plans?.length ?? 0}
              </span>
            </h1>
            <p className="text-slate-500">
              One plan, three durations — Standard (90 days), Pro (180 days),
              Pro+ (1 year).
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push('/admin/plans/new')}
          className="gap-2 shadow-lg shadow-slate-900/20"
          size="lg"
        >
          <Plus className="h-4 w-4" /> Create Plan
        </Button>
      </div>

      {plans?.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
            <Layers className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-slate-900">
            No plans yet
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Create your first plan and its Standard, Pro and Pro+ variants
            are generated automatically — price and configure each side by
            side.
          </p>
          <Button
            onClick={() => router.push('/admin/plans/new')}
            className="mt-6 gap-2"
          >
            <Plus className="h-4 w-4" /> Create Your First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onManage={() => router.push(`/admin/plans/${plan.id}`)}
              onDelete={() => setPlanToDelete(plan.id)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The plan, its Standard, Pro and Pro+
              variants and their prices will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<LoadingSkeletons />}>
      <PlansContent />
    </Suspense>
  );
}
