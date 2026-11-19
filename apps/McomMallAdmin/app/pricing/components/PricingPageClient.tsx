'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import {
  Plan,
  PlanVariant,
  getActivePrice,
  getPriceAmount,
  getTierLabel,
  getVariantDurationLabel,
} from '@/app/admin/types/plan';
import { useGetPlans } from '@/service/plans/hook';
import { Button } from '@/components/ui/button';
import PricingCheckoutClient from './PricingCheckoutClient';

interface SelectedPlan {
  name: string;
  price: string;
  planVariantId: string;
  isTrial: boolean;
}

function formatGBP(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export default function PricingPageClient() {
  const [selected, setSelected] = useState<SelectedPlan | null>(null);
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  // Prices and sellable variants come from the same admin-managed plan catalog
  // used by the customer app. Nothing is hardcoded here.
  const { data: plans, isLoading, isError } = useGetPlans();

  const handlePayNow = (plan: Plan, variant: PlanVariant) => {
    const price = getActivePrice(variant);
    const amount = getPriceAmount(price);
    setSelected({
      name: `${plan.name} · ${getTierLabel(variant.tierLevel.name)}`,
      price: formatGBP(amount),
      planVariantId: variant.id,
      isTrial: false,
    });
  };

  const handleStartTrial = (plan: Plan, variant: PlanVariant) => {
    setSelected({
      name: `${plan.name} · ${getTierLabel(variant.tierLevel.name)}`,
      price: 'Free trial',
      planVariantId: variant.id,
      isTrial: true,
    });
  };

  if (selected) {
    return (
      <PricingCheckoutClient
        planName={selected.name}
        planPrice={selected.price}
        planVariantId={selected.planVariantId}
        isTrial={selected.isTrial}
        isPayg={false}
        listingId={listingId}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    );
  }

  if (isError || !plans) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center text-sm text-rose-600">
        Could not load the plan catalog. Please refresh or contact support.
      </div>
    );
  }

  const activePlans = plans.filter((plan) => plan.isActive);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 md:text-3xl">
          MCOM Mall business plans
        </h1>
        <p className="mt-2 text-gray-600">
          Live prices from the plan catalog. Choose a plan to continue to secure
          checkout.
        </p>
      </header>

      {activePlans.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          No plans are currently on sale.
        </p>
      )}

      <div className="space-y-10">
        {activePlans.map((plan) => {
          const variants = (plan.variants ?? [])
            .filter((variant) => variant.isActive)
            .sort(
              (a, b) =>
                (a.tierLevel?.sortOrder ?? 99) -
                (b.tierLevel?.sortOrder ?? 99),
            );
          if (variants.length === 0) return null;

          return (
            <section key={plan.id}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </h2>
                {plan.description && (
                  <p className="text-sm text-gray-500">{plan.description}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {variants.map((variant) => {
                  const price = getActivePrice(variant);
                  const amount = getPriceAmount(price);
                  return (
                    <div
                      key={variant.id}
                      className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                          {getTierLabel(variant.tierLevel.name)}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatGBP(amount)}
                          <span className="ml-1 text-xs font-normal text-gray-500">
                            / {getVariantDurationLabel(variant)}
                          </span>
                        </p>
                      </div>

                      <ul className="mb-5 flex-1 space-y-1.5 text-xs text-gray-600">
                        {(variant.features ?? [])
                          .slice(0, 6)
                          .map((feature) => (
                            <li key={feature}>• {feature}</li>
                          ))}
                        {(!variant.features ||
                          variant.features.length === 0) && (
                          <li>
                            • Up to{' '}
                            {variant.configuration?.quotas?.maxProducts ?? 0}{' '}
                            products ·{' '}
                            {variant.configuration?.quotas?.maxServices ?? 0}{' '}
                            services
                          </li>
                        )}
                      </ul>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handlePayNow(plan, variant)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          Pay now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStartTrial(plan, variant)}
                          className="w-full"
                        >
                          Start free trial
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
