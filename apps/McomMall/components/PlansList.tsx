'use client';

import { useGetPlans } from '@/service/plans/hooks';
import PlanCard from '@/components/PlanCard';
import { Plan, PlanVariant } from '@/service/plans/types';

interface PlansListProps {
  onSelectPlan: (plan: Plan, variant: PlanVariant) => void;
}

export default function PlansList({ onSelectPlan }: PlansListProps) {
  const { data: plans, isLoading, isError } = useGetPlans();

  if (isLoading) {
    return <div className="text-center py-10">Loading plans...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load plans. Please try again later.
      </div>
    );
  }

  const activePlans = (plans ?? []).filter((plan) => plan.isActive);

  if (activePlans.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No plans are available right now. Please check back later.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        {activePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={(selectedPlan, variant) =>
              onSelectPlan(selectedPlan, variant)
            }
          />
        ))}
      </div>
    </div>
  );
}
