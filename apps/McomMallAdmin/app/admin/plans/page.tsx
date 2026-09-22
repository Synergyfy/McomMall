'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useGetPlans, useDeletePlan } from '@/service/plans/hook';
import {
  Plan,
  PlanTier,
  PlanVariant,
  getActivePrice,
  getPriceAmount,
  getTierLabel,
  getVariantDurationLabel,
} from '@/app/admin/types/plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Layers,
  Pencil,
  Plus,
  Trash2,
  Search,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Check,
  Package,
  Store,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { TIER_THEME } from './components/plan-theme';

const TIER_ORDER = [PlanTier.STANDARD, PlanTier.PRO, PlanTier.PRO_PLUS];

function LoadingSkeletons() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-9 w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-96 rounded-lg bg-slate-100" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 rounded-xl bg-slate-200" />
          <div className="h-10 w-32 rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 border border-slate-200/60 p-4" />
        ))}
      </div>

      {/* Cards Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[0, 1, 2].map((key) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-32 bg-slate-800" />
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-16 rounded-xl bg-slate-100" />
              ))}
            </div>
            <div className="h-14 border-t bg-slate-50" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuotaPreview({ variant }: { variant?: PlanVariant }) {
  if (!variant?.configuration) return null;
  const quotas = variant.configuration.quotas;
  const flags = variant.configuration.featureFlags;

  return (
    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs space-y-2.5">
      <div className="font-semibold text-slate-800 flex items-center justify-between">
        <span>Allowance &amp; Entitlements</span>
        <span className="text-[10px] text-slate-400 font-normal">Level Quotas</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-slate-600">
        <div className="flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5 text-slate-400" />
          <span>Listings: <strong>{quotas?.maxListings === -1 ? 'Unlimited' : (quotas?.maxListings ?? '—')}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-slate-400" />
          <span>Products: <strong>{quotas?.maxProducts === -1 ? 'Unlimited' : (quotas?.maxProducts ?? '—')}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-slate-400" />
          <span>Services: <strong>{quotas?.maxServices === -1 ? 'Unlimited' : (quotas?.maxServices ?? '—')}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          <span>Coupons: <strong>{quotas?.maxCouponTemplates === -1 ? 'Unlimited' : (quotas?.maxCouponTemplates ?? '—')}</strong></span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60">
        {flags?.advancedAnalytics && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
            <Check className="h-2.5 w-2.5" /> Analytics
          </span>
        )}
        {flags?.allowCustomBranding && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200">
            <Check className="h-2.5 w-2.5" /> Custom Branding
          </span>
        )}
        {flags?.priorityInSearch && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
            <Check className="h-2.5 w-2.5" /> Priority Search
          </span>
        )}
        {flags?.dedicatedSupport && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
            <Check className="h-2.5 w-2.5" /> 24/7 Support
          </span>
        )}
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
  const [showQuotas, setShowQuotas] = useState(false);
  const activeVariants =
    plan.variants?.filter((variant) => variant.isActive).length ?? 0;
  const totalVariants = plan.variants?.length ?? 0;
  const variantRatio = totalVariants > 0 ? (activeVariants / totalVariants) * 100 : 0;

  return (
    <Card className="group flex flex-col overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300">
      {/* Header with deep midnight gradient and ambient glow */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 pt-5 pb-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/15 blur-2xl group-hover:bg-indigo-500/25 transition-all" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/10 blur-xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md font-semibold border border-indigo-400/20">
                {plan.slug}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white tracking-tight truncate group-hover:text-indigo-200 transition-colors">
              {plan.name}
            </h2>
            <p className="mt-1 text-xs text-slate-300 line-clamp-1">
              {plan.description || 'Active subscription plan structure for mall businesses.'}
            </p>
          </div>
          {plan.isActive ? (
            <Badge className="shrink-0 border-emerald-400/30 bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Active
            </Badge>
          ) : (
            <Badge className="shrink-0 border-slate-500/30 bg-slate-500/20 text-slate-400 font-semibold px-2.5 py-0.5 rounded-full">
              Paused
            </Badge>
          )}
        </div>

        {/* Variant selling progress indicator */}
        <div className="relative mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            {activeVariants} of {totalVariants} variants active
          </span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${variantRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Variant Cards */}
      <CardContent className="flex-1 space-y-3 p-4">
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
                'group/item rounded-xl border p-3.5 transition-all duration-200',
                selling
                  ? cn('bg-white hover:border-slate-300 hover:shadow-sm', theme.border)
                  : 'border-slate-100 bg-slate-50/60 opacity-60',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                    selling ? cn('bg-gradient-to-br', theme.banner) : 'bg-slate-300',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {getTierLabel(tier)}
                    </p>
                    {!selling && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-slate-500">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {variant ? getVariantDurationLabel(variant) : 'Not configured'}
                    {' · '}One-off checkout
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    £{getPriceAmount(price).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">GBP</span>
                </div>
              </div>

              {/* Collapsed Quotas Inspector */}
              {showQuotas && <QuotaPreview variant={variant} />}
            </div>
          );
        })}

        {/* Toggle Quotas Inspector */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuotas(!showQuotas)}
          className="w-full text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 h-8 gap-1.5"
        >
          {showQuotas ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Hide Quotas &amp; Features
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Inspect Quotas &amp; Features
            </>
          )}
        </Button>
      </CardContent>

      {/* Card Footer with Quick Actions */}
      <CardFooter className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onManage}
            title="Edit plan configuration"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xs transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete plan"
            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={onManage}
          className="text-xs font-bold h-8 px-4 rounded-lg bg-slate-900 text-white hover:bg-indigo-600 shadow-sm transition-all"
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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Compute live KPI stats
  const kpiStats = useMemo(() => {
    const totalPlans = plans?.length || 0;
    const activePlans = plans?.filter((p) => p.isActive).length || 0;
    let totalActiveVariants = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    plans?.forEach((plan) => {
      plan.variants?.forEach((variant) => {
        if (variant.isActive) {
          totalActiveVariants++;
          const price = getPriceAmount(getActivePrice(variant));
          if (price > 0) {
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;
          }
        }
      });
    });

    return {
      totalPlans,
      activePlans,
      totalActiveVariants,
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxPrice,
    };
  }, [plans]);

  // Filter plans based on search and status
  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    return plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? plan.isActive
          : !plan.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [plans, searchQuery, statusFilter]);

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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-600/25">
            <Layers className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Subscription Plans
            </h1>
            <p className="text-sm text-slate-500">
              Unified multi-tier plans powering business storefronts, entitlements, and checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/seasons')}
            className="gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs"
          >
            <Calendar className="h-4 w-4 text-indigo-600" />
            Manage Seasons
          </Button>
          <Button
            onClick={() => router.push('/admin/plans/new')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        </div>
      </div>

      {/* KPI Dashboard Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 bg-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Plans</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{kpiStats.totalPlans}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {kpiStats.activePlans} active in catalog
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 bg-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Variants</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{kpiStats.totalActiveVariants}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Selling across durations</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 bg-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price Spectrum</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                £{kpiStats.minPrice.toFixed(0)} - £{kpiStats.maxPrice.toFixed(0)}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">One-off checkout range</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 bg-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Durations</p>
              <p className="text-2xl font-black text-slate-900 mt-1">3 Tiers</p>
              <p className="text-xs text-slate-500 font-medium mt-1">90d · 180d · 1 Year</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans by name, slug or description..."
            className="pl-9.5 bg-white border-slate-200 h-10 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'default' : 'ghost'}
            onClick={() => setStatusFilter('all')}
            className={cn(
              'h-8 text-xs font-bold rounded-lg px-3',
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            All ({kpiStats.totalPlans})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'active' ? 'default' : 'ghost'}
            onClick={() => setStatusFilter('active')}
            className={cn(
              'h-8 text-xs font-bold rounded-lg px-3',
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            Active ({kpiStats.activePlans})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'inactive' ? 'default' : 'ghost'}
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              'h-8 text-xs font-bold rounded-lg px-3',
              statusFilter === 'inactive'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            Paused ({kpiStats.totalPlans - kpiStats.activePlans})
          </Button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Layers className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {searchQuery ? 'No plans matching search' : 'No plans configured yet'}
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            {searchQuery
              ? 'Try adjusting your search terms or clear filters to see all available plans.'
              : 'Create your first plan to automatically generate Standard, Pro, and Pro+ duration variants.'}
          </p>
          {searchQuery ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-5"
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/admin/plans/new')}
              className="mt-5 gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Create Your First Plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onManage={() => router.push(`/admin/plans/${plan.id}`)}
              onDelete={() => setPlanToDelete(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Delete this plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. The plan, its Standard, Pro and Pro+
              variants and all associated price points will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              Delete Plan
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
