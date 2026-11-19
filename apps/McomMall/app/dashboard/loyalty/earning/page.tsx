'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Check,
  ChevronLeft,
  ChevronsUpDown,
  Coins,
  HelpCircle,
  Package,
  Plus,
  Save,
  Sparkles,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useGetMyProducts } from '@/service/store/products/hook';
import { useGetMyServices } from '@/service/services/hook';
import {
  useLoyaltyEarningConfig,
  useUpdateLoyaltyEarningConfig,
} from '@/service/loyalty/hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EarningScope = 'both' | 'products' | 'services';

const fieldClass =
  'h-11 rounded-xl border-[#e7d9d1] bg-white text-sm text-gray-900 shadow-none placeholder:text-gray-400 focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-100';

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
        {children}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Field help"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-orange-600"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-64 px-3 py-2 text-xs leading-relaxed font-medium"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#a14000] ring-1 ring-orange-100">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

interface PickerItem {
  id: string;
  name: string;
}

/**
 * Older versions of the earning config stored item ids with the dashes removed
 * and upper-cased. Comparing on a normalised key keeps those existing entries
 * matched to the current product/service ids.
 */
const normalizeItemKey = (value: string) =>
  value.replace(/-/g, '').toLowerCase();

function canonicalItemId(value: string, items: PickerItem[]): string | null {
  const key = normalizeItemKey(value);
  return items.find((item) => normalizeItemKey(item.id) === key)?.id ?? null;
}

function normalizeIdList(
  ids: string[] | null | undefined,
  items: PickerItem[]
): string[] {
  const result: string[] = [];
  for (const id of ids ?? []) {
    const canonical = canonicalItemId(id, items);
    if (canonical && !result.includes(canonical)) {
      result.push(canonical);
    }
  }
  return result;
}

function normalizeOverrides(
  overrides: Record<string, number> | null | undefined,
  items: PickerItem[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [id, value] of Object.entries(overrides ?? {})) {
    const canonical = canonicalItemId(id, items);
    const numeric = Number(value);
    // Drop overrides for items that no longer exist; they can never be used.
    if (!canonical || !Number.isFinite(numeric)) continue;
    result[canonical] = numeric;
  }
  return result;
}

function MultiSelect({
  items,
  selected,
  onChange,
  placeholder,
  emptyLabel,
  disabled,
}: {
  items: PickerItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  emptyLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-11 w-full justify-between rounded-xl border-[#e7d9d1] bg-white px-3 text-sm font-normal shadow-none hover:bg-white',
            selected.length === 0 && 'text-gray-400'
          )}
        >
          {selected.length > 0
            ? `${selected.length} selected`
            : emptyLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem key={item.id} onSelect={() => toggle(item.id)}>
                <Check
                  className={cn(
                    'mr-2 h-4 w-4 text-orange-600',
                    selected.includes(item.id) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function OverrideEditor({
  title,
  hint,
  items,
  overrides,
  onChange,
  disabled,
}: {
  title: string;
  hint: string;
  items: PickerItem[];
  overrides: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  disabled?: boolean;
}) {
  const [selectedId, setSelectedId] = useState('');

  const usedIds = Object.keys(overrides);
  const available = items.filter((item) => !usedIds.includes(item.id));
  const nameFor = (id: string) =>
    items.find((item) => item.id === id)?.name ?? 'Unavailable item';

  return (
    <div className="space-y-3">
      <FieldLabel hint={hint}>{title}</FieldLabel>
      {usedIds.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-[#fdfbfa] px-3 py-3 text-xs text-gray-500">
          No custom points yet. Everything uses the base points-per-£1 rule.
        </p>
      ) : (
        <div className="space-y-2">
          {usedIds.map((id) => (
            <div
              key={id}
              className="flex items-center gap-2 rounded-xl border border-[#ece4de] bg-[#fdfbfa] px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                {nameFor(id)}
              </span>
              <Input
                type="number"
                min={0}
                value={overrides[id]}
                onChange={(event) =>
                  onChange({
                    ...overrides,
                    [id]: Number(event.target.value),
                  })
                }
                className="h-9 w-24 rounded-lg text-sm"
                aria-label={`Points for ${nameFor(id)}`}
              />
              <span className="text-xs text-gray-500">pts</span>
              <button
                type="button"
                onClick={() => {
                  const next = { ...overrides };
                  delete next[id];
                  onChange(next);
                }}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remove ${nameFor(id)} override`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          disabled={disabled || available.length === 0}
          className={cn(fieldClass, 'w-full px-3 sm:max-w-sm')}
          aria-label={`Add ${title} override`}
        >
          <option value="">
            {available.length === 0 ? 'All items already customised' : `Add ${title.toLowerCase()}…`}
          </option>
          {available.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          disabled={!selectedId || disabled}
          onClick={() => {
            if (!selectedId) return;
            onChange({ ...overrides, [selectedId]: 10 });
            setSelectedId('');
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

export default function LoyaltyEarningPage() {
  const router = useRouter();
  const { businessId, isLoading: businessLoading } = useBusinessId();
  const { data: products = [], isLoading: productsLoading } = useGetMyProducts();
  const { data: services = [], isLoading: servicesLoading } = useGetMyServices();
  const { data: config, isLoading } = useLoyaltyEarningConfig(businessId);
  const updateConfig = useUpdateLoyaltyEarningConfig();
  const [showSuccess, setShowSuccess] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [scope, setScope] = useState<EarningScope>('products');
  const [pointsPerCurrency, setPointsPerCurrency] = useState('1');
  const [fixedPointsPerOrder, setFixedPointsPerOrder] = useState('0');
  const [minSpend, setMinSpend] = useState('');
  const [includedProductIds, setIncludedProductIds] = useState<string[]>([]);
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);
  const [includedServiceIds, setIncludedServiceIds] = useState<string[]>([]);
  const [excludedServiceIds, setExcludedServiceIds] = useState<string[]>([]);
  const [productPointOverrides, setProductPointOverrides] = useState<
    Record<string, number>
  >({});
  const [servicePointOverrides, setServicePointOverrides] = useState<
    Record<string, number>
  >({});
  const hydratedRef = useRef(false);

  const productItems: PickerItem[] = useMemo(
    () => products.map((product) => ({ id: product.id, name: product.title })),
    [products]
  );
  const serviceItems: PickerItem[] = useMemo(
    () => services.map((service) => ({ id: service.id, name: service.name })),
    [services]
  );

  useEffect(() => {
    if (!config || productsLoading || servicesLoading || hydratedRef.current) {
      return;
    }
    hydratedRef.current = true;

    const normalizedProductOverrides = normalizeOverrides(
      config.productPointOverrides,
      productItems
    );
    const normalizedServiceOverrides = normalizeOverrides(
      config.servicePointOverrides,
      serviceItems
    );
    const productOverrideIds = new Set(Object.keys(normalizedProductOverrides));
    const serviceOverrideIds = new Set(Object.keys(normalizedServiceOverrides));

    // Items with custom points (or already on the other list) can't be on both
    // the included and excluded lists.
    const includedProducts = normalizeIdList(
      config.includedProductIds,
      productItems
    ).filter((id) => !productOverrideIds.has(id));
    const excludedProducts = normalizeIdList(
      config.excludedProductIds,
      productItems
    ).filter(
      (id) => !productOverrideIds.has(id) && !includedProducts.includes(id)
    );
    const includedServices = normalizeIdList(
      config.includedServiceIds,
      serviceItems
    ).filter((id) => !serviceOverrideIds.has(id));
    const excludedServices = normalizeIdList(
      config.excludedServiceIds,
      serviceItems
    ).filter(
      (id) => !serviceOverrideIds.has(id) && !includedServices.includes(id)
    );

    setIsActive(config.isActive ?? true);
    setScope(
      config.earnOnProducts && config.earnOnServices
        ? 'both'
        : config.earnOnServices
          ? 'services'
          : 'products'
    );
    setPointsPerCurrency(String(config.pointsPerCurrency ?? 1));
    setFixedPointsPerOrder(String(config.fixedPointsPerOrder ?? 0));
    setMinSpend(
      config.minSpend === null || config.minSpend === undefined
        ? ''
        : String(config.minSpend)
    );
    setIncludedProductIds(includedProducts);
    setExcludedProductIds(excludedProducts);
    setIncludedServiceIds(includedServices);
    setExcludedServiceIds(excludedServices);
    setProductPointOverrides(normalizedProductOverrides);
    setServicePointOverrides(normalizedServiceOverrides);
  }, [config, productItems, productsLoading, serviceItems, servicesLoading]);

  const productOverrideIds = useMemo(
    () => new Set(Object.keys(productPointOverrides)),
    [productPointOverrides]
  );
  const serviceOverrideIds = useMemo(
    () => new Set(Object.keys(servicePointOverrides)),
    [servicePointOverrides]
  );

  const includedProductOptions = useMemo(
    () =>
      productItems.filter(
        (item) =>
          !excludedProductIds.includes(item.id) &&
          !productOverrideIds.has(item.id)
      ),
    [productItems, excludedProductIds, productOverrideIds]
  );
  const excludedProductOptions = useMemo(
    () =>
      productItems.filter(
        (item) =>
          !includedProductIds.includes(item.id) &&
          !productOverrideIds.has(item.id)
      ),
    [productItems, includedProductIds, productOverrideIds]
  );
  const includedServiceOptions = useMemo(
    () =>
      serviceItems.filter(
        (item) =>
          !excludedServiceIds.includes(item.id) &&
          !serviceOverrideIds.has(item.id)
      ),
    [serviceItems, excludedServiceIds, serviceOverrideIds]
  );
  const excludedServiceOptions = useMemo(
    () =>
      serviceItems.filter(
        (item) =>
          !includedServiceIds.includes(item.id) &&
          !serviceOverrideIds.has(item.id)
      ),
    [serviceItems, includedServiceIds, serviceOverrideIds]
  );

  const handleIncludedProductsChange = (ids: string[]) => {
    setIncludedProductIds(ids);
    setExcludedProductIds((current) =>
      current.filter((id) => !ids.includes(id))
    );
  };
  const handleExcludedProductsChange = (ids: string[]) => {
    setExcludedProductIds(ids);
    setIncludedProductIds((current) =>
      current.filter((id) => !ids.includes(id))
    );
  };
  const handleIncludedServicesChange = (ids: string[]) => {
    setIncludedServiceIds(ids);
    setExcludedServiceIds((current) =>
      current.filter((id) => !ids.includes(id))
    );
  };
  const handleExcludedServicesChange = (ids: string[]) => {
    setExcludedServiceIds(ids);
    setIncludedServiceIds((current) =>
      current.filter((id) => !ids.includes(id))
    );
  };
  const handleProductOverridesChange = (next: Record<string, number>) => {
    setProductPointOverrides(next);
    const ids = new Set(Object.keys(next));
    setIncludedProductIds((current) =>
      current.filter((id) => !ids.has(id))
    );
    setExcludedProductIds((current) =>
      current.filter((id) => !ids.has(id))
    );
  };
  const handleServiceOverridesChange = (next: Record<string, number>) => {
    setServicePointOverrides(next);
    const ids = new Set(Object.keys(next));
    setIncludedServiceIds((current) =>
      current.filter((id) => !ids.has(id))
    );
    setExcludedServiceIds((current) =>
      current.filter((id) => !ids.has(id))
    );
  };

  const productsEnabled = scope === 'both' || scope === 'products';
  const servicesEnabled = scope === 'both' || scope === 'services';

  const handleSave = async () => {
    if (!businessId) {
      toast.error('No business profile found.');
      return;
    }
    const perCurrency = Number(pointsPerCurrency);
    const fixed = Number(fixedPointsPerOrder);
    if (!Number.isFinite(perCurrency) || perCurrency < 0) {
      toast.error('Points per £1 must be zero or more.');
      return;
    }
    if (!Number.isFinite(fixed) || fixed < 0) {
      toast.error('Bonus points must be zero or more.');
      return;
    }

    try {
      await updateConfig.mutateAsync({
        businessId,
        isActive,
        earnOnProducts: productsEnabled,
        earnOnServices: servicesEnabled,
        pointsPerCurrency: Math.round(perCurrency),
        fixedPointsPerOrder: Math.round(fixed),
        minSpend: minSpend === '' ? null : Number(minSpend),
        includedProductIds,
        excludedProductIds,
        includedServiceIds,
        excludedServiceIds,
        productPointOverrides,
        servicePointOverrides,
      });
      setShowSuccess(true);
    } catch {
      toast.error('Could not save earning rules.');
    }
  };

  if (businessLoading || isLoading || productsLoading || servicesLoading) {
    return (
      <div className="min-h-full bg-[#faf7f5] p-6 text-sm text-gray-500">
        Loading earning rules…
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="-mx-2 -mt-2 min-h-full bg-[#faf7f5] px-4 py-6 sm:-mx-5 sm:-mt-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/dashboard/loyalty"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Loyalty
          </Link>

          <header className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Point Earning Rules
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
                Decide how customers earn points when they order from you. Only
                members who joined your loyalty programme earn points.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateConfig.isPending || !businessId}
              className="h-11 rounded-xl bg-[#a14000] px-6 text-sm font-semibold text-white hover:bg-[#8a3700]"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateConfig.isPending ? 'Saving…' : 'Save rules'}
            </Button>
          </header>

          <div className="space-y-5">
            <Card className="gap-0 overflow-hidden rounded-2xl border-[#efe3dc] bg-white py-0 shadow-[0_2px_10px_rgba(31,27,24,0.04)]">
              <CardHeader className="border-b border-[#f6ece6] px-5 py-5 sm:px-6">
                <SectionHeader
                  icon={<Coins className="h-5 w-5" />}
                  title="Earning Basics"
                  description="The base rule that applies to every eligible item."
                />
              </CardHeader>
              <CardContent className="space-y-5 px-5 py-6 sm:px-6">
                <div className="flex items-start justify-between gap-4 rounded-xl border border-[#ece4de] bg-[#fdfbfa] p-4">
                  <div>
                    <FieldLabel hint="Turn point earning on or off without deleting your rules. When off, customers earn nothing from new orders or bookings.">
                      Enable point earning
                    </FieldLabel>
                    <p className="mt-1 text-xs text-gray-500">
                      Members earn points automatically after a completed order
                      or booking.
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-2.5">
                  <FieldLabel hint="Choose what earns points: physical products, service bookings, or both. You can still include or exclude individual items below.">
                    What earns points?
                  </FieldLabel>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { value: 'products', label: 'Products only' },
                      { value: 'services', label: 'Services only' },
                      { value: 'both', label: 'Products & services' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setScope(option.value as EarningScope)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all',
                          scope === option.value
                            ? 'border-orange-400 bg-orange-50 text-[#a14000] ring-1 ring-orange-200'
                            : 'border-[#ece4de] bg-white text-gray-600 hover:border-orange-200'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="grid gap-2.5">
                    <FieldLabel
                      htmlFor="pointsPerCurrency"
                      hint="Base earning rate. 2 means a customer earns 2 points for every £1 spent. £50 order = 100 points."
                    >
                      Points per £1
                    </FieldLabel>
                    <Input
                      id="pointsPerCurrency"
                      type="number"
                      min={0}
                      value={pointsPerCurrency}
                      onChange={(event) =>
                        setPointsPerCurrency(event.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <FieldLabel
                      htmlFor="fixedPointsPerOrder"
                      hint="Optional flat bonus added once per order or booking, on top of the spend-based points."
                    >
                      Bonus per order
                    </FieldLabel>
                    <Input
                      id="fixedPointsPerOrder"
                      type="number"
                      min={0}
                      value={fixedPointsPerOrder}
                      onChange={(event) =>
                        setFixedPointsPerOrder(event.target.value)
                      }
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <FieldLabel
                      htmlFor="minSpend"
                      hint="Orders below this amount earn no points. Leave blank for no minimum."
                    >
                      Minimum spend (£)
                    </FieldLabel>
                    <Input
                      id="minSpend"
                      type="number"
                      min={0}
                      step="0.01"
                      value={minSpend}
                      onChange={(event) => setMinSpend(event.target.value)}
                      placeholder="No minimum"
                      className={fieldClass}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 overflow-hidden rounded-2xl border-[#efe3dc] bg-white py-0 shadow-[0_2px_10px_rgba(31,27,24,0.04)]">
              <CardHeader className="border-b border-[#f6ece6] px-5 py-5 sm:px-6">
                <SectionHeader
                  icon={<Package className="h-5 w-5" />}
                  title="Include & Exclude Items"
                  description="Fine-tune which products and services are eligible. Empty include lists mean everything. Items with custom points are handled separately."
                />
              </CardHeader>
              <CardContent className="space-y-5 px-5 py-6 sm:px-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-2.5">
                    <FieldLabel hint="Only these products earn points. Leave empty to let every product earn points (unless excluded).">
                      Included products
                    </FieldLabel>
                    <MultiSelect
                      items={includedProductOptions}
                      selected={includedProductIds}
                      onChange={handleIncludedProductsChange}
                      placeholder="Search products…"
                      emptyLabel="All products"
                      disabled={!productsEnabled}
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <FieldLabel hint="Products on this list never earn points. Items already included or given custom points won't appear here.">
                      Excluded products
                    </FieldLabel>
                    <MultiSelect
                      items={excludedProductOptions}
                      selected={excludedProductIds}
                      onChange={handleExcludedProductsChange}
                      placeholder="Search products…"
                      emptyLabel="No products excluded"
                      disabled={!productsEnabled}
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <FieldLabel hint="Only these services earn points on completed bookings. Leave empty for all services.">
                      Included services
                    </FieldLabel>
                    <MultiSelect
                      items={includedServiceOptions}
                      selected={includedServiceIds}
                      onChange={handleIncludedServicesChange}
                      placeholder="Search services…"
                      emptyLabel="All services"
                      disabled={!servicesEnabled}
                    />
                  </div>
                  <div className="grid gap-2.5">
                    <FieldLabel hint="Services on this list never earn points on bookings. Items already included or given custom points won't appear here.">
                      Excluded services
                    </FieldLabel>
                    <MultiSelect
                      items={excludedServiceOptions}
                      selected={excludedServiceIds}
                      onChange={handleExcludedServicesChange}
                      placeholder="Search services…"
                      emptyLabel="No services excluded"
                      disabled={!servicesEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 overflow-hidden rounded-2xl border-[#efe3dc] bg-white py-0 shadow-[0_2px_10px_rgba(31,27,24,0.04)]">
              <CardHeader className="border-b border-[#f6ece6] px-5 py-5 sm:px-6">
                <SectionHeader
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Custom Points per Item"
                  description="Give a specific product or service a fixed number of points instead of the spend-based rate."
                />
              </CardHeader>
              <CardContent className="space-y-6 px-5 py-6 sm:px-6">
                <OverrideEditor
                  title="Product points"
                  hint="When set, this fixed amount replaces the points-per-£1 calculation for that product. Products with custom points are removed from the include/exclude lists."
                  items={productItems}
                  overrides={productPointOverrides}
                  onChange={handleProductOverridesChange}
                  disabled={!productsEnabled}
                />
                <OverrideEditor
                  title="Service points"
                  hint="When set, this fixed amount replaces the spend-based points for a completed booking of that service. Services with custom points are removed from the include/exclude lists."
                  items={serviceItems}
                  overrides={servicePointOverrides}
                  onChange={handleServiceOverridesChange}
                  disabled={!servicesEnabled}
                />
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs leading-relaxed text-amber-800">
              Customers must join your loyalty programme from your public
              listing page before they can earn points. Points are credited
              once per order or booking after it completes.
            </div>

            <div className="flex justify-end pb-4">
              <Button
                type="button"
                onClick={handleSave}
                disabled={updateConfig.isPending || !businessId}
                className="h-11 rounded-xl bg-[#a14000] px-6 text-sm font-semibold text-white hover:bg-[#8a3700]"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateConfig.isPending ? 'Saving…' : 'Save rules'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-lg">
              Earning rules saved!
            </DialogTitle>
            <DialogDescription className="text-center">
              Nice work — your loyalty programme is ready. Customers who join
              will now earn points based on these rules.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                router.push('/dashboard/loyalty');
              }}
              className="h-11 rounded-xl bg-[#a14000] px-6 text-sm font-semibold text-white hover:bg-[#8a3700]"
            >
              Go to overview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
