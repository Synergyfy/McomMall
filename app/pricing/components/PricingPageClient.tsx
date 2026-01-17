'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PricingCheckoutClient from './PricingCheckoutClient';
import { Tier } from '@/service/tiers/types';
import TiersList from '@/app/dashboard/my-subscription/components/TiersList';

export default function PricingPageClient() {
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: string } | null>(null);
  const [isTrial, setIsTrial] = useState(false);

  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  const handleSelectTier = (tier: Tier, cycle: 'monthly' | 'quarterly' | 'annual') => {
      let price = 0;
      switch(cycle) {
        case 'monthly': price = tier.monthly_price; break;
        case 'quarterly': price = tier.quaterly_price; break;
        case 'annual': price = tier.annual_price; break;
      }

      const priceString = new Intl.NumberFormat('en-GB', {
           style: 'currency', currency: 'GBP'
      }).format(Number(price));

      setSelectedTier({
          name: `${tier.name} (${cycle})`,
          price: priceString
      });
      setIsTrial(false);
  };

  if (selectedTier) {
    return (
      <PricingCheckoutClient
        planName={selectedTier.name}
        planPrice={selectedTier.price}
        isTrial={isTrial}
        isPayg={false}
        listingId={listingId}
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
        <TiersList onSelectTier={handleSelectTier} />
      </section>
    </div>
  );
}
