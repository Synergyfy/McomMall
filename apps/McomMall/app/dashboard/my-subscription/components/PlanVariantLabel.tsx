'use client';

import { useGetPlans } from '@/service/plans/hooks';
import {
  getTierLabel,
  getVariantDurationLabel,
} from '@/service/plans/types';

interface PlanVariantLabelProps {
  planVariantId: string;
}

/** Resolves "Plan · Tier (duration)" for a purchased variant via cached plans. */
export default function PlanVariantLabel({
  planVariantId,
}: PlanVariantLabelProps) {
  const { data: plans } = useGetPlans();

  for (const plan of plans ?? []) {
    const variant = plan.variants?.find(
      (item) => item.id === planVariantId,
    );
    if (variant) {
      return (
        <span className="font-semibold text-gray-700">
          {plan.name} · {getTierLabel(variant.tierLevel.name)} (
          {getVariantDurationLabel(variant)})
        </span>
      );
    }
  }

  return (
    <span className="font-semibold text-gray-700">Plan purchase</span>
  );
}
