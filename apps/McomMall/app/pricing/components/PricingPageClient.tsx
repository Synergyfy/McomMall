'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import PricingCheckoutClient from './PricingCheckoutClient';
import PlansList from '@/components/PlansList';
import {
  Plan,
  PlanVariant,
  formatPlanPrice,
  getActivePrice,
  getPriceAmount,
  getTierLabel,
  getVariantDurationLabel,
} from '@/service/plans/types';
import { PlanType } from '@/service/payments/types';

export default function PricingPageClient() {
  const { userRole } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const [selected, setSelected] = useState<{
    name: string;
    price: string;
    planVariantId?: string;
    tierId?: string;
    planType?: string;
  } | null>(null);
  const [isTrial, setIsTrial] = useState(false);

  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  // PayPal return/cancel lands here with the purchase encoded in the URL
  // (the PayPal redirect reloads the app, losing in-memory selection).
  // Restoring selection mounts the checkout, which completes/cancels the
  // payment from the token PayPal appended.
  const paypalState = searchParams.get('paypal');
  const urlPlanName = searchParams.get('planName');
  const urlPlanPrice = searchParams.get('planPrice');
  const urlPlanVariantId = searchParams.get('planVariantId');
  const urlTierId = searchParams.get('tierId');
  const urlPlanType = searchParams.get('planType');

  useEffect(() => {
    if (
      !selected &&
      (paypalState === 'return' || paypalState === 'cancelled') &&
      urlPlanName &&
      urlPlanPrice &&
      (urlPlanVariantId || urlTierId)
    ) {
      setSelected({
        name: urlPlanName,
        price: urlPlanPrice,
        planVariantId: urlPlanVariantId ?? undefined,
        tierId: urlTierId ?? undefined,
        planType: urlPlanType ?? undefined,
      });
    }
  }, [
    selected,
    paypalState,
    urlPlanName,
    urlPlanPrice,
    urlPlanVariantId,
    urlTierId,
    urlPlanType,
  ]);

  const handleSelectPlan = (plan: Plan, variant: PlanVariant) => {
    const tierLabel = getTierLabel(variant.tierLevel.name);
    setSelected({
      name: `${plan.name} · ${tierLabel} (${getVariantDurationLabel(variant)})`,
      price: formatPlanPrice(getPriceAmount(getActivePrice(variant))),
      planVariantId: variant.id,
    });
    setIsTrial(false);
  };

  if (isMounted && userRole === 'customer') {
    return (
      <div className="h-full p-4 md:py-10 md:px-20 flex flex-col items-center">
        <div className="max-w-2xl w-full bg-white border rounded-2xl p-8 shadow-sm text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Business plans
          </h1>
          <p className="text-sm text-gray-600">
            Membership and business packages are available to business accounts
            only. Customer accounts can shop, book services, and use their MCOM
            Wallet without a paid plan.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <PricingCheckoutClient
        planName={selected.name}
        planPrice={selected.price}
        isTrial={isTrial}
        isPayg={false}
        listingId={listingId}
        planVariantId={selected.planVariantId}
        tierId={selected.tierId}
        planType={selected.planType as PlanType | undefined}
      />
    );
  }

  return (
    <div className="h-full p-4 md:py-10 md:px-20 flex flex-col items-center overflow-y-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-semibold">
          McomMall Packages and Pricing
        </h1>
        <p className="text-lg md:text-xl text-gray-800 font-medium mt-2">
          Select the package that serves your need.
        </p>
      </header>

      {/* Video Guide Section */}
      <section className="w-full max-w-6xl mb-12 flex flex-col items-center">
        <div className="w-full p-6 sm:p-8 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="flex-1 flex flex-col items-center md:items-start">
              <h2 className="text-2xl sm:text-3xl font-bold text-center md:text-left mb-2 text-blue-900">
                Your Co-Branded Launchpad
              </h2>
              <p className="text-center md:text-left text-gray-600 mb-6 text-base sm:text-lg font-medium">
                Unlock your brand’s growth. Choose from our plans and gain access to
                tools, support, and marketing designed to boost your visibility from day one.
              </p>
            </div>
            <div className="w-full md:w-1/2 aspect-video">
              <iframe
                className="w-full h-full rounded-lg shadow-md"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full flex flex-col items-center">
        <h3 className="text-xl md:text-2xl font-medium text-center mb-6">
            Select your plan
        </h3>
        <PlansList onSelectPlan={handleSelectPlan} />
      </section>
    </div>
  );
}
