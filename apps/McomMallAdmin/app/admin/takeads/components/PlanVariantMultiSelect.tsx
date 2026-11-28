'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plan } from '@/app/admin/types/plan';
import { useGetPlans } from '@/service/plans/hook';
import { cn } from '@/lib/utils';

const TIER_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  PRO: 'Pro',
  PRO_PLUS: 'Pro+',
};

export const formatPlanVariantLabel = (
  planName: string,
  tierName?: string,
) => `${planName} · ${TIER_LABELS[tierName ?? ''] ?? tierName ?? 'Standard'}`;

interface PlanVariantMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

/** Pick concrete Plan × tier variants created in /admin/plans. */
export default function PlanVariantMultiSelect({
  value,
  onChange,
  disabled,
}: PlanVariantMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: plans = [], isLoading } = useGetPlans();

  const allLabels = useMemo(() => {
    const labels = new Map<string, string>();
    plans.forEach((plan: Plan) =>
      plan.variants?.forEach((variant) =>
        labels.set(
          variant.id,
          formatPlanVariantLabel(plan.name, variant.tierLevel?.name),
        ),
      ),
    );
    return labels;
  }, [plans]);

  const options = useMemo(
    () =>
      plans
        .filter((plan) => plan.isActive)
        .flatMap((plan: Plan) =>
          (plan.variants ?? [])
            .filter((variant) => variant.isActive)
            .map((variant) => ({
              value: variant.id,
              label: formatPlanVariantLabel(plan.name, variant.tierLevel?.name),
              searchText: `${plan.name} ${variant.tierLevel?.name ?? ''}`,
            })),
        ),
    [plans],
  );

  const selectedLabels = value.map(
    (id) => allLabels.get(id) ?? `${id.slice(0, 8)}…`,
  );

  const toggle = (id: string) => {
    const next = value.includes(id)
      ? value.filter((current) => current !== id)
      : [...value, id];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label>Allowed plan variants</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="About allowed plan variants"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            Choose the plan variants from /admin/plans that may see this deal,
            for example Gold · Pro or Silver · Standard. This is audience
            targeting only; no individual business is selected.
          </TooltipContent>
        </Tooltip>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-label="Allowed plan variants"
            aria-expanded={open}
            disabled={disabled}
            className="h-auto min-h-10 w-full justify-between font-normal"
          >
            <span className="flex flex-wrap gap-1 text-left">
              {selectedLabels.length ? (
                selectedLabels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-500">
                  {isLoading ? 'Loading plan variants…' : 'Select plan variants'}
                </span>
              )}
            </span>
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder="Search plan variants…" />
            <CommandList>
              <CommandEmpty>
                {isLoading
                  ? 'Loading plan variants…'
                  : 'No active plan variants found.'}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.searchText}
                    onSelect={() => toggle(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(option.value)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-slate-500">
        {value.length
          ? `${value.length} plan variant${value.length === 1 ? '' : 's'} selected. Only these businesses will see the deal.`
          : 'Select at least one plan variant when the audience is plan-only.'}
      </p>
    </div>
  );
}
