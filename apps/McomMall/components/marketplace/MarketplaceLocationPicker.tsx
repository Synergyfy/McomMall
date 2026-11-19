'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Navigation,
  Search,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useGetMarketplaceLocations,
  useSearchMarketplaceLocations,
} from '@/service/marketplace/discovery';
import {
  MarketplaceLocationFacet,
  MarketplaceLocationLevel,
  MarketplaceLocationSearchResult,
  ResolvedMarketplaceLocation,
} from '@/service/marketplace/types';
import { cn } from '@/lib/utils';

export type MarketplaceLocationSelection =
  | { level: 'all'; name: string }
  | { level: 'near'; name: string }
  | { level: MarketplaceLocationLevel; id: string; name: string };

interface MarketplaceLocationPickerProps {
  selection: MarketplaceLocationSelection;
  resolved?: ResolvedMarketplaceLocation;
  isResolving?: boolean;
  onSelect: (selection: MarketplaceLocationSelection) => void;
  onUseMyLocation: () => void;
}

const LEVEL_LABEL: Record<MarketplaceLocationLevel, string> = {
  city: 'City',
  borough: 'Borough',
  'high-street': 'High Street',
  'local-mall': 'Local Mall',
  area: 'Area',
  postcode: 'Postcode',
};

const DEPTH_LEVEL: MarketplaceLocationLevel[] = [
  'city',
  'borough',
  'high-street',
  'local-mall',
];

interface FlatFacet {
  node: MarketplaceLocationFacet;
  level: MarketplaceLocationLevel;
  path: string[];
}

function flatten(
  nodes: MarketplaceLocationFacet[],
  depth = 0,
  parents: string[] = [],
): FlatFacet[] {
  return nodes.flatMap((node) => {
    const path = [...parents, node.name];
    const level = DEPTH_LEVEL[depth] || 'local-mall';
    return [
      { node, level, path },
      ...flatten(node.children || [], depth + 1, path),
    ];
  });
}

export default function MarketplaceLocationPicker({
  selection,
  resolved,
  isResolving,
  onSelect,
  onUseMyLocation,
}: MarketplaceLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [path, setPath] = useState<MarketplaceLocationFacet[]>([]);
  const { data: facets, isLoading } = useGetMarketplaceLocations();
  const { data: searchResponse } = useSearchMarketplaceLocations(debouncedSearch);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const allNodes = useMemo(() => {
    const hierarchy = flatten(facets?.cities || []);
    const areas: FlatFacet[] = (facets?.areas || []).map((node) => ({
      node,
      level: 'area',
      path: [node.name],
    }));
    return [...hierarchy, ...areas];
  }, [facets?.cities, facets?.areas]);

  const searchResults = useMemo<MarketplaceLocationSearchResult[]>(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    const local = allNodes
      .filter(
        (item) =>
          item.node.name.toLowerCase().includes(query) ||
          item.path.some((part) => part.toLowerCase().includes(query)),
      )
      .map((item) => ({
        level: item.level,
        id: item.node.id,
        name: item.node.name,
        count: item.node.count,
        path: item.path,
      }));

    const remote = searchResponse?.results || [];
    const seen = new Set<string>();
    return [...local, ...remote]
      .filter((result) => {
        const key = `${result.level}:${result.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 40);
  }, [allNodes, search, searchResponse]);

  const currentNodes =
    path.length === 0 ? facets?.cities || [] : path[path.length - 1].children || [];
  const currentLevel = DEPTH_LEVEL[path.length] || 'city';
  const parent = path[path.length - 1] || null;

  const triggerLabel =
    selection.level === 'all'
      ? 'All locations'
      : selection.level === 'near'
        ? `Near ${selection.name}`
        : selection.name;

  const handleNodeClick = (node: MarketplaceLocationFacet) => {
    const level = DEPTH_LEVEL[path.length] || 'city';
    // The row selects the place; the chevron drills into its children. This
    // matches the "select the city, or go further" behaviour.
    onSelect({ level, id: node.id, name: node.name });
    setOpen(false);
    setSearch('');
    setPath([]);
  };

  const handleDrill = (node: MarketplaceLocationFacet) => {
    if (!node.children?.length) return;
    setPath([...path, node]);
  };

  const handleSelect = (node: MarketplaceLocationFacet, level: MarketplaceLocationLevel) => {
    onSelect({ level, id: node.id, name: node.name });
    setOpen(false);
    setSearch('');
    setPath([]);
  };

  const reset = () => {
    setSearch('');
    setPath([]);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50/50"
        >
          <MapPin className="h-4 w-4 text-orange-500" />
          <span className="hidden text-xs font-medium text-gray-400 sm:inline">
            Deliver to
          </span>
          <span className="max-w-[150px] truncate text-gray-900 sm:max-w-[220px]">
            {triggerLabel}
          </span>
          {isResolving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[calc(100vw-2rem)] max-w-[440px] overflow-hidden p-0"
      >
        <div className="border-b border-gray-100 p-4">
          <p className="text-sm font-bold text-gray-900">Choose your location</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Products, services, vouchers, gift cards and coupons are shown for
            the sellers in your area.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search postcode, city, borough, high street or mall"
                className="h-9 bg-gray-50 pl-9 text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1.5 text-xs"
              onClick={() => {
                onUseMyLocation();
                setOpen(false);
              }}
              disabled={isResolving}
            >
              {isResolving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              My location
            </Button>
          </div>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {search ? (
            <div className="space-y-0.5">
              {searchResults.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-500">
                  No matching locations yet.
                </p>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={`${result.level}-${result.id}-${result.path.join('/')}`}
                    type="button"
                    onClick={() => {
                      onSelect({
                        level: result.level,
                        id: result.id,
                        name: result.name,
                      });
                      setOpen(false);
                      setSearch('');
                      setPath([]);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {result.name}
                        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          {LEVEL_LABEL[result.level]}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-gray-400">
                        {result.path.join(' › ')}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      {result.count}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="mb-1 flex flex-wrap items-center gap-1 px-2 py-1 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => setPath([])}
                  className={cn(
                    'rounded px-1.5 py-0.5 hover:bg-gray-100',
                    path.length === 0 && 'font-semibold text-gray-900',
                  )}
                >
                  All cities
                </button>
                {path.map((node, index) => (
                  <span key={`${node.id}-${index}`} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-gray-300" />
                    <button
                      type="button"
                      onClick={() => setPath(path.slice(0, index + 1))}
                      className={cn(
                        'max-w-[120px] truncate rounded px-1.5 py-0.5 hover:bg-gray-100',
                        index === path.length - 1 &&
                          'font-semibold text-gray-900',
                      )}
                    >
                      {node.name}
                    </button>
                  </span>
                ))}
              </div>

              {path.length === 0 && (
                <>
                  <OptionRow
                    icon={<MapPin className="h-4 w-4 text-orange-500" />}
                    title="All locations"
                    subtitle="Show everything on the marketplace"
                    selected={selection.level === 'all'}
                    onClick={() => {
                      onSelect({ level: 'all', name: 'All locations' });
                      setOpen(false);
                    }}
                  />
                  {resolved?.scope && (
                    <OptionRow
                      icon={<Navigation className="h-4 w-4 text-blue-500" />}
                      title={`Near ${resolved.scope.name}`}
                      subtitle="Local mall → high street → borough → city"
                      selected={selection.level === 'near'}
                      onClick={() => {
                        onSelect({
                          level: 'near',
                          name: resolved.scope?.name || 'you',
                        });
                        setOpen(false);
                      }}
                    />
                  )}
                </>
              )}

              {path.length > 0 && parent && (
                <OptionRow
                  icon={<MapPin className="h-4 w-4 text-orange-500" />}
                  title={`All ${parent.name}`}
                  subtitle={`Everything in this ${LEVEL_LABEL[DEPTH_LEVEL[path.length - 1] || 'city'].toLowerCase()}`}
                  count={parent.count}
                  selected={
                    selection.level !== 'all' &&
                    selection.level !== 'near' &&
                    selection.id === parent.id
                  }
                  onClick={() => {
                    onSelect({
                      level: DEPTH_LEVEL[path.length - 1] || 'city',
                      id: parent.id,
                      name: parent.name,
                    });
                    setOpen(false);
                    setPath([]);
                  }}
                />
              )}

              <div className="my-2 h-px bg-gray-100" />

              {isLoading && !facets ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                </div>
              ) : currentNodes.length === 0 &&
                (path.length > 0 || (facets?.areas?.length || 0) === 0) ? (
                <p className="px-3 py-8 text-center text-sm text-gray-500">
                  No businesses in this area yet.
                </p>
              ) : (
                <>
                  {currentNodes.length > 0 && (
                    <>
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {path.length === 0
                          ? 'Cities with businesses'
                          : `Select a ${LEVEL_LABEL[currentLevel].toLowerCase()}`}
                      </p>
                      {currentNodes.map((node) => (
                        <div
                          key={node.id}
                          className="group flex items-center rounded-lg hover:bg-gray-50"
                        >
                          <button
                            type="button"
                            onClick={() => handleNodeClick(node)}
                            className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2.5 text-left"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-gray-900">
                                {node.name}
                              </span>
                              <span className="block text-xs text-gray-400">
                                {node.count}{' '}
                                {node.count === 1 ? 'business' : 'businesses'}
                              </span>
                            </span>
                          </button>
                          {node.children?.length ? (
                            <button
                              type="button"
                              aria-label={`Explore ${node.name}`}
                              onClick={() => handleDrill(node)}
                              className="mr-2 rounded-md p-1.5 text-gray-400 hover:bg-white hover:text-orange-500"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Select ${node.name}`}
                              onClick={() =>
                                handleSelect(
                                  node,
                                  DEPTH_LEVEL[path.length] || 'local-mall',
                                )
                              }
                              className="mr-2 rounded-md p-1.5 text-gray-300 hover:bg-white hover:text-orange-500"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {path.length === 0 &&
                    (facets?.areas?.length || 0) > 0 && (
                      <>
                        <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                          Areas from saved postcodes
                        </p>
                        {(facets?.areas || []).map((area) => (
                          <div
                            key={area.id}
                            className="group flex items-center rounded-lg hover:bg-gray-50"
                          >
                            <button
                              type="button"
                              onClick={() => handleSelect(area, 'area')}
                              className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2.5 text-left"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-gray-900">
                                  {area.name}
                                </span>
                                <span className="block text-xs text-gray-400">
                                  {area.count}{' '}
                                  {area.count === 1 ? 'business' : 'businesses'}
                                </span>
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Select ${area.name}`}
                              onClick={() => handleSelect(area, 'area')}
                              className="mr-2 rounded-md p-1.5 text-gray-300 hover:bg-white hover:text-orange-500"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                </>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OptionRow({
  icon,
  title,
  subtitle,
  count,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50',
        selected && 'bg-orange-50/70',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-xs text-gray-400">
            {subtitle}
          </span>
        )}
      </span>
      {count !== undefined && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
          {count}
        </span>
      )}
      {selected && <Check className="h-4 w-4 shrink-0 text-orange-500" />}
    </button>
  );
}
