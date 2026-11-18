'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetAllAdminProducts } from '@/service/product/hook';
import { useGetAllAdminServices } from '@/service/services/hook';
import { cn } from '@/lib/utils';

export interface PickerOption {
    id: string;
    name: string;
    businessId?: string;
    businessName?: string;
}

interface PickerShellProps {
    kind: 'product' | 'service';
    value: string[];
    onChange: (ids: string[]) => void;
    options: PickerOption[];
    isLoading?: boolean;
    isError?: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    businessIds?: string[];
    placeholder: string;
    emptyText: string;
}

function PickerShell({
    kind,
    value,
    onChange,
    options,
    isLoading,
    isError,
    search,
    onSearchChange,
    businessIds,
    placeholder,
    emptyText,
}: PickerShellProps) {
    const [open, setOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, PickerOption>>({});

    const optionById = useMemo(() => {
        const map = new Map<string, PickerOption>();
        options.forEach((option) => map.set(option.id, option));
        return map;
    }, [options]);

    // Drop cached labels for ids that are no longer selected (e.g. form reset).
    useEffect(() => {
        setSelectedOptions((current) => {
            const next: Record<string, PickerOption> = {};
            for (const [id, option] of Object.entries(current)) {
                if (value.includes(id)) next[id] = option;
            }
            return Object.keys(next).length === Object.keys(current).length ? current : next;
        });
    }, [value]);

    const visibleOptions = useMemo(() => {
        if (!businessIds || businessIds.length === 0) return options;
        return options.filter(
            (option) => option.businessId && businessIds.includes(option.businessId),
        );
    }, [options, businessIds]);

    const toggle = (option: PickerOption) => {
        if (value.includes(option.id)) {
            onChange(value.filter((id) => id !== option.id));
            return;
        }
        setSelectedOptions((current) => ({ ...current, [option.id]: option }));
        onChange([...value, option.id]);
    };

    const remove = (id: string) => {
        onChange(value.filter((valueId) => valueId !== id));
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) onSearchChange('');
            }}
        >
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    aria-label={`Select ${kind}s`}
                    tabIndex={0}
                    className={cn(
                        'flex min-h-10 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm shadow-sm transition-colors',
                        'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
                    )}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setOpen(true);
                            return;
                        }
                        // Let the admin start typing straight into the control;
                        // the first character becomes the search term.
                        if (
                            event.key.length === 1 &&
                            !event.metaKey &&
                            !event.ctrlKey &&
                            !event.altKey
                        ) {
                            event.preventDefault();
                            onSearchChange(event.key);
                            setOpen(true);
                        }
                    }}
                >
                    {value.length === 0 && (
                        <>
                            <Search className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="px-1 text-slate-400">{placeholder}</span>
                        </>
                    )}
                    {value.map((id) => {
                        const option = selectedOptions[id] ?? optionById.get(id);
                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                className="max-w-full gap-1 bg-slate-100 py-0.5 pl-2 pr-1 font-normal text-slate-700"
                            >
                                <span className="truncate">{option?.name ?? `${id.slice(0, 8)}…`}</span>
                                <span
                                    role="button"
                                    tabIndex={-1}
                                    aria-label={`Remove ${option?.name ?? id}`}
                                    className="rounded-sm p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        remove(id);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            remove(id);
                                        }
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </span>
                            </Badge>
                        );
                    })}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        autoFocus
                        placeholder={`Search ${kind}s by name…`}
                        value={search}
                        onValueChange={onSearchChange}
                    />
                    <CommandList>
                        {isLoading && (
                            <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Searching…
                            </div>
                        )}
                        {!isLoading && isError && (
                            <div className="px-3 py-4 text-sm text-red-500">
                                Could not load {kind}s. Try again.
                            </div>
                        )}
                        {!isLoading && !isError && (
                            <CommandEmpty>{emptyText}</CommandEmpty>
                        )}
                        {!isError && (
                            <CommandGroup>
                                {visibleOptions.map((option) => {
                                    const selected = value.includes(option.id);
                                    return (
                                        <CommandItem
                                            key={option.id}
                                            value={option.id}
                                            onSelect={() => toggle(option)}
                                            className="gap-2"
                                        >
                                            <Check
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    selected ? 'opacity-100 text-orange-600' : 'opacity-0',
                                                )}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate">{option.name}</span>
                                                {option.businessName && (
                                                    <span className="block truncate text-xs text-slate-400">
                                                        {option.businessName}
                                                    </span>
                                                )}
                                            </span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface EntityMultiSelectProps {
    kind: 'product' | 'service';
    value: string[];
    onChange: (ids: string[]) => void;
    /** When set, only options belonging to these shop ids are offered. */
    businessIds?: string[];
}

export function EntityMultiSelect({ kind, value, onChange, businessIds }: EntityMultiSelectProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);

    if (kind === 'product') {
        return (
            <ProductPicker
                value={value}
                onChange={onChange}
                businessIds={businessIds}
                search={search}
                onSearchChange={setSearch}
                debouncedSearch={debouncedSearch}
            />
        );
    }

    return (
        <ServicePicker
            value={value}
            onChange={onChange}
            businessIds={businessIds}
            search={search}
            onSearchChange={setSearch}
            debouncedSearch={debouncedSearch}
        />
    );
}

function ProductPicker({
    value,
    onChange,
    businessIds,
    search,
    onSearchChange,
    debouncedSearch,
}: Omit<EntityMultiSelectProps, 'kind'> & {
    search: string;
    onSearchChange: (value: string) => void;
    debouncedSearch: string;
}) {
    const { data, isLoading, isError } = useGetAllAdminProducts({
        search: debouncedSearch || undefined,
        page: 1,
        limit: 20,
    });

    const options = useMemo<PickerOption[]>(
        () =>
            (data?.data ?? []).map((product) => ({
                id: product.id,
                name: product.name,
                businessId: product.businessId,
                businessName: product.businessName,
            })),
        [data],
    );

    return (
        <PickerShell
            kind="product"
            value={value}
            onChange={onChange}
            options={options}
            isLoading={isLoading}
            isError={isError}
            search={search}
            onSearchChange={onSearchChange}
            businessIds={businessIds}
            placeholder="Search and select products…"
            emptyText={
                businessIds?.length
                    ? 'No products found for the selected shops.'
                    : 'No products found.'
            }
        />
    );
}

function ServicePicker({
    value,
    onChange,
    businessIds,
    search,
    onSearchChange,
    debouncedSearch,
}: Omit<EntityMultiSelectProps, 'kind'> & {
    search: string;
    onSearchChange: (value: string) => void;
    debouncedSearch: string;
}) {
    const { data, isLoading, isError } = useGetAllAdminServices({
        search: debouncedSearch || undefined,
        page: 1,
        limit: 20,
    });

    const options = useMemo<PickerOption[]>(
        () =>
            (data?.data ?? []).map((service) => ({
                id: service.id,
                name: service.name,
                businessId: service.businessId,
                businessName: service.businessName,
            })),
        [data],
    );

    return (
        <PickerShell
            kind="service"
            value={value}
            onChange={onChange}
            options={options}
            isLoading={isLoading}
            isError={isError}
            search={search}
            onSearchChange={onSearchChange}
            businessIds={businessIds}
            placeholder="Search and select services…"
            emptyText={
                businessIds?.length
                    ? 'No services found for the selected shops.'
                    : 'No services found.'
            }
        />
    );
}
