'use client';

import { useGetSubscriptionStatus } from '@/service/payments/hook';
import CurrentPlanCard from './CurrentPlanCard';
import TiersList from './TiersList';

export default function MySubscriptionPageClient() {
  const { data: subscriptionStatus, isLoading } = useGetSubscriptionStatus();

  return (
    <div className="h-full md:py-10 md:px-20 flex flex-col items-center overflow-y-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-semibold">
          My Subscription
        </h1>
        <p className="text-xl text-gray-800 font-medium">
          View your current subscription and manage your plan.
        </p>
      </header>

      {isLoading && <p>Loading...</p>}

      {subscriptionStatus && (
        <div className="mb-10 w-full max-w-4xl">
           <CurrentPlanCard subscription={subscriptionStatus} />
        </div>
      )}

      <section className="w-full flex flex-col items-center">
        <h3 className="text-xl md:text-2xl font-medium text-center mb-6">
            Select your plan
        </h3>
        <TiersList />
      </section>
    </div>
  );
}
