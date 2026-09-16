import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import {
  Plan,
  PlanVariant,
  formatPlanPrice,
  getActivePrice,
  getPriceAmount,
  getSellableVariants,
  getTierLabel,
  getVariantDurationLabel,
} from '@/service/plans/types';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan, variant: PlanVariant) => void;
}

function themeColorForPlan(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('gold')) return '#EAB308';
  if (lower.includes('silver')) return '#94A3B8';
  if (lower.includes('bronze')) return '#B45309';
  if (lower.includes('platinum')) return '#64748B';
  return '#EA580C';
}

export default function PlanCard({ plan, onSelect }: PlanCardProps) {
  const sellable = getSellableVariants(plan);
  const [selectedId, setSelectedId] = useState<string>(
    sellable[0]?.id ?? '',
  );
  const selected =
    sellable.find((variant) => variant.id === selectedId) ?? sellable[0];

  const themeColor = themeColorForPlan(plan.name);

  if (!selected) {
    return null;
  }

  const price = getActivePrice(selected);
  const formattedPrice = formatPlanPrice(getPriceAmount(price));
  const quotas = selected.configuration?.quotas;

  const quotaItems = quotas
    ? [
        { label: `${quotas.maxListings} Listings`, value: quotas.maxListings > 0 },
        { label: `${quotas.maxProducts} Products`, value: quotas.maxProducts > 0 },
        { label: `${quotas.maxServices} Services`, value: quotas.maxServices > 0 },
        {
          label: `${quotas.maxCouponTemplates} Coupon Templates`,
          value: quotas.maxCouponTemplates > 0,
        },
        {
          label: `${quotas.maxGiftCardTemplates} Gift Card Templates`,
          value: quotas.maxGiftCardTemplates > 0,
        },
        {
          label: `${quotas.maxLoyaltyPrograms} Loyalty Programs`,
          value: quotas.maxLoyaltyPrograms > 0,
        },
      ].filter((item) => item.value)
    : [];

  const displayFeatures = (selected.features ?? []).slice(0, 6);

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="flex flex-col h-full bg-white border-2 shadow-md relative overflow-hidden"
        style={{ borderColor: themeColor }}
      >
        <CardHeader>
          <CardTitle
            className="text-lg sm:text-xl font-bold"
            style={{ color: themeColor }}
          >
            {plan.name}
          </CardTitle>
          {plan.description && (
            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
          )}
          <h3
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: themeColor }}
          >
            {formattedPrice}
            <span className="text-sm font-normal text-gray-500 ml-1">
              one-off · {getVariantDurationLabel(selected)}
            </span>
          </h3>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {sellable.map((variant) => {
              const isSelected = variant.id === selected.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedId(variant.id)}
                  className={cn(
                    'rounded-lg border-2 px-2 py-2 text-center transition-all',
                    isSelected
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
                  )}
                >
                  <span className="block text-xs font-bold">
                    {getTierLabel(variant.tierLevel.name)}
                  </span>
                  <span
                    className={cn(
                      'block text-[11px]',
                      isSelected ? 'text-gray-300' : 'text-gray-500',
                    )}
                  >
                    {getVariantDurationLabel(variant)}
                  </span>
                  <span className="block text-xs font-semibold mt-1">
                    {formatPlanPrice(
                      getPriceAmount(getActivePrice(variant)),
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {quotaItems.length > 0 && (
            <ul className="space-y-2 mb-2">
              {quotaItems.map((item, index) => (
                <li
                  key={`quota-${index}`}
                  className="flex items-start text-sm text-gray-700 font-medium"
                >
                  <Check
                    className="mr-2 h-4 w-4 flex-shrink-0 mt-1"
                    style={{ color: themeColor }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}

          {displayFeatures.length > 0 && (
            <>
              <hr className="border-gray-100 my-2" />
              <ul className="space-y-2">
                {displayFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <Check
                      className="mr-2 h-4 w-4 flex-shrink-0 mt-1"
                      style={{ color: themeColor }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={() => onSelect(plan, selected)}
            className="w-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: themeColor }}
          >
            Choose {getTierLabel(selected.tierLevel.name)}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
