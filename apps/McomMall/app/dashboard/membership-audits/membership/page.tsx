'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetMyMembership } from '@/service/membership/hooks';
import { useGetPlans } from '@/service/plans/hooks';
import PricingCheckoutClient from '@/app/pricing/components/PricingCheckoutClient';
import {
  Plan,
  PlanTierLevelName,
  PlanVariant,
  formatPlanPrice,
  getActivePrice,
  getPriceAmount,
  getTierLabel,
  getVariantDurationLabel,
} from '@/service/plans/types';
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Check,
  Minus,
  Calendar,
  TrendingUp,
  Layers,
  RefreshCw,
  Zap,
  Rocket,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VARIANT_TABS: Array<{
  tier: PlanTierLevelName;
  label: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { tier: 'STANDARD', label: 'Standard', duration: '90 days', icon: Zap },
  { tier: 'PRO', label: 'Pro', duration: '180 days', icon: Rocket },
  { tier: 'PRO_PLUS', label: 'Pro+', duration: '1 year', icon: Crown },
];

function findVariant(
  plans: Plan[] | undefined,
  planVariantId: string,
): { plan: Plan; variant: PlanVariant } | null {
  for (const plan of plans ?? []) {
    const variant = plan.variants?.find((item) => item.id === planVariantId);
    if (variant) return { plan, variant };
  }
  return null;
}

export default function MembershipPlansDashboard() {
  const { data: membership, isLoading: isMemberLoading } = useGetMyMembership();
  const { data: plans, isLoading: isPlansLoading } = useGetPlans();

  const [selection, setSelection] = useState<{
    plan: Plan;
    variant: PlanVariant;
  } | null>(null);
  const [variantTier, setVariantTier] =
    useState<PlanTierLevelName>('STANDARD');

  const isLoading = isMemberLoading || isPlansLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 border-4 border-t-[#ff6900] border-orange-100 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Fetching membership configurations...</span>
      </div>
    );
  }

  // If a plan variant is selected, render the checkout flow in-place —
  // same mechanics as the old tier checkout, now keyed by planVariantId.
  if (selection) {
    const { plan, variant } = selection;
    const tierLabel = getTierLabel(variant.tierLevel.name);
    const priceString = formatPlanPrice(
      getPriceAmount(getActivePrice(variant)),
    );

    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-4xl mx-auto my-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Checkout</h3>
          <Button
            variant="ghost"
            onClick={() => setSelection(null)}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            ← Back to Plans
          </Button>
        </div>
        <PricingCheckoutClient
          planName={`${plan.name} · ${tierLabel} (${getVariantDurationLabel(variant)})`}
          planPrice={priceString}
          isTrial={false}
          isPayg={false}
          listingId={null}
          planVariantId={variant.id}
        />
      </div>
    );
  }

  const activeMembership = membership?.isActive ? membership : null;
  const purchased = activeMembership?.planVariantId
    ? findVariant(plans, activeMembership.planVariantId)
    : null;
  const privilegeQuotas =
    purchased?.variant.configuration?.quotas ??
    activeMembership?.tier?.configuration?.quotas;
  const privilegeFlags =
    purchased?.variant.configuration?.featureFlags ??
    activeMembership?.tier?.configuration?.featureFlags;
  const planDisplayName = purchased
    ? `${purchased.plan.name} · ${getTierLabel(purchased.variant.tierLevel.name)}`
    : (activeMembership?.tier?.name ?? 'Free Plan');

  const variantForPlan = (plan: Plan): PlanVariant | null => {
    const exact = plan.variants?.find(
      (item) => item.tierLevel?.name === variantTier && item.isActive,
    );
    if (exact) return exact;
    const fallback = [...(plan.variants ?? [])]
      .filter((item) => item.isActive)
      .sort(
        (a, b) =>
          (a.tierLevel?.sortOrder ?? 99) - (b.tierLevel?.sortOrder ?? 99),
      );
    return fallback[0] ?? null;
  };

  const activePlans = (plans ?? []).filter((plan) => plan.isActive);
  const sortedEntries = activePlans
    .map((plan) => ({ plan, variant: variantForPlan(plan) }))
    .filter(
      (entry): entry is { plan: Plan; variant: PlanVariant } =>
        entry.variant !== null,
    )
    .sort(
      (a, b) =>
        getPriceAmount(getActivePrice(a.variant)) -
        getPriceAmount(getActivePrice(b.variant)),
    );

  const scrollToPlans = () => {
    document.getElementById('plans-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRenew = () => {
    if (purchased) {
      setSelection(purchased);
    } else {
      scrollToPlans();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Current Subscription Summary */}
      {activeMembership ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Plan: {planDisplayName}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5 flex-wrap">
                  {activeMembership.expiresAt && (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Renews on {new Date(activeMembership.expiresAt).toLocaleDateString()}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                    </>
                  )}
                  <span className="capitalize">
                    {purchased
                      ? `${getVariantDurationLabel(purchased.variant)} · One-off billing`
                      : `${activeMembership.planType} Billing Cycle`}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-center gap-4">
              <div className="flex-1 md:flex-initial">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-500">Profile Completeness</span>
                  <span className="text-[#ff6900]">78%</span>
                </div>
                <div className="w-40 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">You are on the Free Plan</h3>
            <p className="text-xs text-gray-500 mt-1">Upgrade to Bronze, Silver, or Gold to showcase your storefront and boost footfall.</p>
          </div>
          <Button
            onClick={scrollToPlans}
            className="bg-[#ff6900] hover:bg-[#a14000] text-white"
          >
            Select a Plan Below
          </Button>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Membership Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={scrollToPlans}
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Upgrade Plan</h5>
            <p className="text-xs text-gray-400 mt-1">Explore higher tiers to boost storefront footfall and search priority</p>
          </button>

          <button
            onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Compare Plans</h5>
            <p className="text-xs text-gray-400 mt-1">Compare features, limits, and pricing side-by-side</p>
          </button>

          <button
            onClick={handleRenew}
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Renew Membership</h5>
            <p className="text-xs text-gray-400 mt-1">Extend your current plan variant or manage your active subscription</p>
          </button>

          <Link
            href="/dashboard/support-tickets"
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group w-full"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Contact Support</h5>
            <p className="text-xs text-gray-400 mt-1">Talk to our customer service and billing team</p>
          </Link>
        </div>
      </div>

      {/* Current Features vs Locked Features */}
      {activeMembership && privilegeQuotas ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Your Plan Privileges</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5" />
                Active Benefits
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Listings</span>
                  <span className="text-emerald-600 font-bold">Up to {privilegeQuotas.maxListings}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Products & Services</span>
                  <span className="text-emerald-600 font-bold">
                    {privilegeQuotas.maxProducts} products · {privilegeQuotas.maxServices} services
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Images Per Listing</span>
                  <span className="text-emerald-600 font-bold">Up to {privilegeQuotas.maxImagesPerListing}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Loyalty Programs</span>
                  <span className="text-emerald-600 font-bold">Up to {privilegeQuotas.maxLoyaltyPrograms}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Featured Placement</span>
                  <span className="text-emerald-600 font-bold">
                    {privilegeQuotas.featuredListingAllowance > 0
                      ? `${privilegeQuotas.featuredListingAllowance} active slots`
                      : 'Not included'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Search Priority</span>
                  <span className="text-emerald-600 font-bold">
                    {privilegeFlags?.priorityInSearch ? 'Priority rotator' : 'Standard rotator'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-amber-600 flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-5 h-5" />
                Locked Features (Upgrade to unlock)
              </h5>
              <div className="space-y-3">
                {[
                  { key: 'advancedAnalytics', title: 'Advanced Analytics CRM', text: 'Realtime customer conversion and journey details.' },
                  { key: 'dedicatedSupport', title: 'Dedicated Support', text: 'A named agent for billing and storefront help.' },
                  { key: 'allowCustomBranding', title: 'Custom Branding Styling', text: 'Tailor background cards and color codes for storefronts.' },
                  { key: 'allowGroupCreation', title: 'Group Creation & Automations', text: 'Circles, flows and QR automations for loyal customers.' },
                ].filter((item) => !(privilegeFlags as Record<string, boolean> | undefined)?.[item.key]).map((item) => (
                  <div key={item.key} className="flex justify-between items-center bg-amber-50/30 border border-amber-100 p-3 rounded-xl">
                    <div>
                      <h6 className="font-bold text-xs text-gray-800">{item.title}</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.text}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={scrollToPlans}
                      className="bg-[#ff6900] hover:bg-[#a14000] text-white text-[10px] py-1.5 px-3 h-8 rounded-lg font-bold"
                    >
                      Upgrade
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Variant Toggle selector */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-black text-gray-900">Select Your Membership Plan</h3>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Pick a duration, then choose the plan that fits your business. Each variant is a one-off payment for the full period.
        </p>

        <div className="inline-flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
          {VARIANT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = variantTier === tab.tier;
            return (
              <button
                key={tab.tier}
                onClick={() => setVariantTier(tab.tier)}
                className={cn(
                  'px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2',
                  isSelected
                    ? 'bg-[#ff6900] text-white shadow-md shadow-orange-600/20'
                    : 'text-gray-500 hover:text-gray-800',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-black',
                    isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#ff6900]',
                  )}
                >
                  {tab.duration}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan Cards for the selected variant */}
      <div id="plans-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEntries.map(({ plan, variant }) => {
          const isCurrent = activeMembership?.planVariantId === variant.id;
          const price = getActivePrice(variant);
          const amount = getPriceAmount(price);
          const duration = getVariantDurationLabel(variant);

          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                isCurrent
                  ? 'border-[#ff6900] ring-1 ring-[#ff6900]/30 bg-[#fcf8f6]/10'
                  : 'border-gray-200'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[#ff6900] text-white text-[9px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                  Active
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {getTierLabel(variant.tierLevel.name)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 h-8 line-clamp-2 leading-relaxed">
                  {plan.description || 'Boost business operations and expand community reach.'}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-950">{formatPlanPrice(amount)}</span>
                  <span className="text-xs text-gray-400 font-medium">one-off</span>
                </div>
                <span className="text-[10px] text-orange-600 font-semibold mt-1 block">
                  {duration} access · billed once
                </span>

                <div className="mt-6 border-t border-gray-100 pt-5 space-y-3.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Features:</span>
                  <ul className="space-y-2.5">
                    {(variant.features ?? []).slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-[#ff6900] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                    <li className="flex gap-2 items-start text-xs text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-[#ff6900] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Up to {variant.configuration?.quotas?.maxListings ?? 0} listings
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  disabled={isCurrent}
                  onClick={() => setSelection({ plan, variant })}
                  className={`w-full py-5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 border-none'
                      : 'bg-[#ff6900] hover:bg-[#a14000] text-white shadow-md shadow-orange-600/10'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Select ${getTierLabel(variant.tierLevel.name)} · ${formatPlanPrice(amount)}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedEntries.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          No plans are available right now. Please check back later.
        </div>
      )}

      {/* Comparison Table across plans for the selected variant */}
      <div id="comparison-table" className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h4 className="text-lg font-bold text-gray-900 mb-1">Compare Plans Side-by-Side</h4>
        <p className="text-xs text-gray-400 mb-6">
          Showing the {VARIANT_TABS.find((tab) => tab.tier === variantTier)?.label} variant of each plan.
        </p>
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 font-bold text-gray-800 text-sm">Privileges & Benefits</th>
                {sortedEntries.map(({ plan }) => (
                  <th key={plan.id} className="py-4 px-4 font-extrabold text-gray-900 text-center text-sm">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-gray-600">
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Price (one-off)</td>
                {sortedEntries.map(({ plan, variant }) => (
                  <td key={plan.id} className="py-4 px-4 text-center font-bold text-gray-800">
                    {formatPlanPrice(getPriceAmount(getActivePrice(variant)))}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Duration</td>
                {sortedEntries.map(({ plan, variant }) => (
                  <td key={plan.id} className="py-4 px-4 text-center font-medium text-gray-800">
                    {getVariantDurationLabel(variant)}
                  </td>
                ))}
              </tr>
              {[
                { label: 'Listings', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxListings ?? 0}` },
                { label: 'Products', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxProducts ?? 0}` },
                { label: 'Services', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxServices ?? 0}` },
                { label: 'Images Per Listing', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxImagesPerListing ?? 0}` },
                { label: 'Gift Card Templates', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxGiftCardTemplates ?? 0}` },
                { label: 'Coupon Templates', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxCouponTemplates ?? 0}` },
                { label: 'Loyalty Programs', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.maxLoyaltyPrograms ?? 0}` },
                { label: 'Featured Slots', get: (variant: PlanVariant) => `${variant.configuration?.quotas?.featuredListingAllowance ?? 0}` },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-gray-50/50">
                  <td className="py-4 font-semibold text-gray-700">{row.label}</td>
                  {sortedEntries.map(({ plan, variant }) => (
                    <td key={plan.id} className="py-4 px-4 text-center font-medium text-gray-800">
                      {row.get(variant)}
                    </td>
                  ))}
                </tr>
              ))}
              {[
                { label: 'Priority In Search', key: 'priorityInSearch' },
                { label: 'Advanced Analytics', key: 'advancedAnalytics' },
                { label: 'Dedicated Support', key: 'dedicatedSupport' },
                { label: 'Custom Branding', key: 'allowCustomBranding' },
                { label: 'Group Creation', key: 'allowGroupCreation' },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-gray-50/50">
                  <td className="py-4 font-semibold text-gray-700">{row.label}</td>
                  {sortedEntries.map(({ plan, variant }) => {
                    const enabled =
                      (variant?.configuration?.featureFlags as Record<string, boolean> | undefined)?.[row.key] ?? false;
                    return (
                      <td key={plan.id} className="py-4 px-4 text-center">
                        {enabled ? (
                          <Check className="w-4 h-4 text-emerald-600 inline" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-300 inline" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
