'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Gift,
  Ticket,
  Briefcase,
  ShoppingBag,
  LayoutDashboard,
  ArrowRight,
  Store,
  BadgePercent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketplaceSidebar, {
  MarketplaceFiltersState,
} from '@/components/marketplace/MarketplaceSidebar';
import ProductCard from '@/components/marketplace/ProductCard';
import VoucherCard from '@/components/marketplace/VoucherCard';
import GiftCardCard from '@/components/marketplace/GiftCardCard';
import ServiceCard from '@/components/marketplace/ServiceCard';
import BusinessCard from '@/components/marketplace/BusinessCard';
import Pagination from '@/components/marketplace/Pagination';
import MarketplaceSection from '@/components/marketplace/MarketplaceSection';
import MarketplaceLocationPicker, {
  MarketplaceLocationSelection,
} from '@/components/marketplace/MarketplaceLocationPicker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useGetMarketplacePublic } from '@/service/marketplace/hook';
import {
  ResolveLocationParams,
  useGetPublicProducts,
  useGetPublicServices,
  useGetPublicVouchers,
  useGetPublicGiftCards,
  useGetPublicCoupons,
  useGetPublicBusinesses,
  useResolveMarketplaceLocation,
} from '@/service/marketplace/discovery';
import {
  SidebarBanner,
  PageMetaDto,
  MarketplacePublicData,
  PageDto,
  PublicBusiness,
  ResolvedMarketplaceLocation,
} from '@/service/marketplace/types';
import { PromotionalItem } from '@/lib/listing-data';
import { Product } from '@/service/listings/types';
import ExternalOfferCard from '@/components/promotional/ExternalOfferCard';
import { useGetPublicPromotionalOffers } from '@/service/promotional-offers/hook';
import TakeadsOfferCard from '@/components/takeads/TakeadsOfferCard';
import { useGetPublicTakeadsOffers } from '@/service/takeads/hook';
import { PublicTakeadsOffer } from '@/service/takeads/types';

const ITEMS_PER_PAGE = 12;

type ListingType =
  | 'all'
  | 'products'
  | 'services'
  | 'businesses'
  | 'vouchers'
  | 'gift-cards'
  | 'coupons'
  | 'promotional'
  | 'affiliate';

type MarketItem = {
  id?: string | number;
  title?: string;
  name?: string;
  price?: number | string | null;
  salePrice?: number | string;
  amount?: number | string;
  fixedAmounts?: number[] | null;
  imageUrl?: string | null;
  image?: string;
  url?: string;
  backgroundImage?: string | null;
  media?: string[] | null;
  category?: string;
};

type MarketplaceQueryParams = Record<string, string | string[] | undefined>;

const LISTING_TYPES: ListingType[] = [
  'all',
  'products',
  'services',
  'businesses',
  'vouchers',
  'gift-cards',
  'coupons',
  'promotional',
  'affiliate',
];

const MARKETPLACE_QUERY_KEYS = [
  'search',
  'q',
  'type',
  'category',
  'minPrice',
  'maxPrice',
  'brand',
  'rating',
  'locationLevel',
  'locationId',
  'locationName',
  'sort',
  'page',
];

function getQueryValues(
  query: MarketplaceQueryParams,
  key: string,
): string[] {
  const value = query[key];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' ? [value] : [];
}

function getInitialLocationSelection(
  query: MarketplaceQueryParams,
): MarketplaceLocationSelection {
  const [level] = getQueryValues(query, 'locationLevel');
  const [id] = getQueryValues(query, 'locationId');
  const [name] = getQueryValues(query, 'locationName');

  if (level === 'all') return { level, name: name || 'All locations' };
  if (level === 'near') return { level, name: name || 'Near me' };
  if (
    ['city', 'borough', 'high-street', 'local-mall', 'area', 'postcode'].includes(
      level || '',
    ) &&
    id
  ) {
    return {
      level: level as Exclude<
        MarketplaceLocationSelection['level'],
        'all' | 'near'
      >,
      id,
      name: name || id,
    };
  }

  return { level: 'all', name: 'All locations' };
}

function getInitialFilters(
  query: MarketplaceQueryParams,
): MarketplaceFiltersState {
  const numberParam = (key: string, fallback: number) => {
    const value = Number(getQueryValues(query, key)[0]);
    return Number.isFinite(value) ? value : fallback;
  };
  const minPrice = Math.min(5000, Math.max(0, numberParam('minPrice', 0)));
  const maxPrice = Math.min(
    5000,
    Math.max(minPrice, numberParam('maxPrice', 5000)),
  );
  const rating = numberParam('rating', 0);

  return {
    categories: getQueryValues(query, 'category'),
    priceRange: [minPrice, maxPrice],
    brands: getQueryValues(query, 'brand'),
    minRating: rating > 0 ? rating : null,
  };
}

interface MarketplaceClientProps {
  initialPublicData?: MarketplacePublicData;
  initialNewProducts?: PageDto<Product>;
  initialSearch?: string;
  initialQueryParams?: MarketplaceQueryParams;
}

export default function MarketplaceClient({
  initialPublicData,
  initialNewProducts,
  initialSearch = '',
  initialQueryParams = {},
}: MarketplaceClientProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSidebarSlide, setActiveSidebarSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listingType, setListingType] = useState<ListingType>(() => {
    const [type] = getQueryValues(initialQueryParams, 'type');
    return LISTING_TYPES.includes(type as ListingType)
      ? (type as ListingType)
      : 'all';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(getQueryValues(initialQueryParams, 'page')[0]);
    return Number.isInteger(page) && page > 0 ? page : 1;
  });
  const [sortOption, setSortOption] = useState(
    () => getQueryValues(initialQueryParams, 'sort')[0] || 'newest',
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<MarketplaceFiltersState>(() =>
    getInitialFilters(initialQueryParams),
  );

  // ── Location ────────────────────────────────────────────────────────────
  const [locationSelection, setLocationSelection] =
    useState<MarketplaceLocationSelection>(() =>
      getInitialLocationSelection(initialQueryParams),
    );
  const [resolveParams, setResolveParams] =
    useState<ResolveLocationParams | null>(null);
  const [cachedResolved, setCachedResolved] =
    useState<ResolvedMarketplaceLocation | null>(null);
  const hasUserSelectedLocation = useRef(false);
  const locationRestored = useRef(false);
  const previousLocationSelection = useRef(locationSelection);
  const hasInitialPageParam = useRef(
    Number.isInteger(Number(getQueryValues(initialQueryParams, 'page')[0])) &&
      Number(getQueryValues(initialQueryParams, 'page')[0]) > 0,
  ).current;
  const hasMarketplaceQuery = useRef(
    MARKETPLACE_QUERY_KEYS.some((key) =>
      Object.prototype.hasOwnProperty.call(initialQueryParams, key),
    ),
  ).current;

  const { data: resolvedQueryData, isFetching: isResolvingLocation } =
    useResolveMarketplaceLocation(resolveParams);

  const resolvedLocation = resolvedQueryData ?? cachedResolved ?? undefined;

  useEffect(() => {
    let hasFreshResolved = false;

    try {
      if (hasMarketplaceQuery) {
        hasUserSelectedLocation.current = locationSelection.level !== 'near';
      } else {
        const stored = localStorage.getItem('mcom_marketplace_location');
        if (stored) {
          const parsed = JSON.parse(stored) as MarketplaceLocationSelection;
          const validLevels = [
            'all',
            'near',
            'city',
            'borough',
            'high-street',
            'local-mall',
            'area',
            'postcode',
          ];
          const validExplicit =
            parsed?.level === 'all' ||
            parsed?.level === 'near' ||
            (validLevels.includes(parsed?.level) &&
              Boolean((parsed as { id?: string }).id));
          if (parsed?.level && validExplicit) {
            setLocationSelection(parsed);
            // "Near me" should keep tracking the shopper; an explicit
            // city/borough/high street/mall choice should not be overwritten.
            hasUserSelectedLocation.current = parsed.level !== 'near';
          }
        }
      }

      // Resolving a signed-in shopper costs one Central call. Cache the
      // result for a day so navigating back to the marketplace does not
      // repeat it; "My location" deliberately bypasses this cache.
      const storedResolved = localStorage.getItem(
        'mcom_marketplace_resolved_location',
      );
      if (storedResolved) {
        const parsed = JSON.parse(storedResolved) as {
          value: ResolvedMarketplaceLocation;
          savedAt: number;
        };
        if (
          parsed?.value?.scope &&
          parsed?.savedAt &&
          Date.now() - parsed.savedAt < 24 * 60 * 60 * 1000
        ) {
          setCachedResolved(parsed.value);
          hasFreshResolved = true;
        }
      }
    } catch {
      // Ignore malformed storage.
    }

    locationRestored.current = true;
    if (!hasFreshResolved) setResolveParams({});
  }, []);

  useEffect(() => {
    if (!resolvedQueryData?.scope) return;
    setCachedResolved(resolvedQueryData);
    try {
      localStorage.setItem(
        'mcom_marketplace_resolved_location',
        JSON.stringify({
          value: resolvedQueryData,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // Storage may be unavailable (private mode).
    }
  }, [resolvedQueryData]);

  useEffect(() => {
    if (!locationRestored.current) return;
    try {
      localStorage.setItem(
        'mcom_marketplace_location',
        JSON.stringify(locationSelection),
      );
    } catch {
      // Storage may be unavailable (private mode).
    }
    if (previousLocationSelection.current !== locationSelection) {
      setCurrentPage(1);
    }
    previousLocationSelection.current = locationSelection;
  }, [locationSelection]);

  useEffect(() => {
    if (!resolvedLocation?.scope) return;
    if (hasUserSelectedLocation.current) return;
    setLocationSelection({
      level: 'near',
      name: resolvedLocation.scope.name,
    });
  }, [resolvedLocation]);

  // Deep-link support: /marketplace?search=shoes lands on the combined search
  // view with the query already applied. Switching tabs keeps the query.
  useEffect(() => {
    setSearchQuery(initialSearch);
    if (initialSearch.trim() && !hasInitialPageParam) {
      setCurrentPage(1);
    }
  }, [initialSearch]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    MARKETPLACE_QUERY_KEYS.forEach((key) => params.delete(key));

    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (listingType !== 'all') params.set('type', listingType);
    filters.categories.forEach((category) =>
      params.append('category', category),
    );
    if (filters.priceRange[0] > 0) {
      params.set('minPrice', String(filters.priceRange[0]));
    }
    if (filters.priceRange[1] < 5000) {
      params.set('maxPrice', String(filters.priceRange[1]));
    }
    filters.brands.forEach((brand) => params.append('brand', brand));
    if (filters.minRating !== null) {
      params.set('rating', String(filters.minRating));
    }
    if (locationSelection.level !== 'all') {
      params.set('locationLevel', locationSelection.level);
      if ('id' in locationSelection) {
        params.set('locationId', locationSelection.id);
      }
      params.set('locationName', locationSelection.name);
    }
    if (sortOption !== 'newest') params.set('sort', sortOption);
    if (currentPage > 1) params.set('page', String(currentPage));

    const queryString = params.toString();
    const nextUrl = `${url.pathname}${queryString ? `?${queryString}` : ''}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, [
    currentPage,
    filters,
    listingType,
    locationSelection,
    searchQuery,
    sortOption,
  ]);

  const handleLocationSelect = (selection: MarketplaceLocationSelection) => {
    hasUserSelectedLocation.current = true;
    setLocationSelection(selection);
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Location is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        hasUserSelectedLocation.current = false;
        setResolveParams({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        toast.error(
          'We could not access your location. Pick a city or area instead.',
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  };

  const activeScope = useMemo(() => {
    if (locationSelection.level === 'near') {
      return resolvedLocation?.scope
        ? {
            type: resolvedLocation.scope.type,
            id: resolvedLocation.scope.id,
            name: resolvedLocation.scope.name,
          }
        : null;
    }
    if (locationSelection.level === 'all') return null;
    return {
      type: locationSelection.level,
      id: locationSelection.id,
      name: locationSelection.name,
    };
  }, [locationSelection, resolvedLocation]);

  const locationParams = useMemo(() => {
    if (!activeScope) return {};
    return {
      locationType: activeScope.type,
      locationId: activeScope.id,
      locationName: activeScope.name,
      nearLocalMallId: resolvedLocation?.hierarchy.localMall?.id,
      nearHighStreetId: resolvedLocation?.hierarchy.highStreet?.id,
      nearBoroughId: resolvedLocation?.hierarchy.borough?.id,
    };
  }, [activeScope, resolvedLocation]);

  // Data Fetching: Landing Page
  const { data: publicData, isLoading: isPublicDataLoading } =
    useGetMarketplacePublic(locationParams, {
      initialData: activeScope ? undefined : initialPublicData,
    });

  const heroSlides = useMemo(() => publicData?.heroSlides || [], [publicData]);
  const sidebarBanners = useMemo(
    () => publicData?.sidebarBanners || [],
    [publicData],
  );
  const apiCategories = useMemo(
    () => publicData?.categories || [],
    [publicData],
  );
  const sections = useMemo(() => publicData?.sections || {}, [publicData]);

  // Resolve Category ID from Selection
  const selectedCategoryId = useMemo(() => {
    if (filters.categories.length === 0) return undefined;
    // Assuming single category selection for now or taking the first one
    const selectedName = filters.categories[0];
    const categoryObj = apiCategories.find((c) => c.name === selectedName);
    return categoryObj?.targetCategoryId;
  }, [filters.categories, apiCategories]);

  // Data Fetching: Discovery
  const isSearching = searchQuery.trim().length > 0;

  const discoveryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    // Only pass category if we have a valid resolved UUID.
    // If user selected a name but ID isn't found, we don't filter (fallback) to avoid empty grid on mismatch.
    category: selectedCategoryId || undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
    ...locationParams,
  };

  // Fetch "New Products" specifically for the "All" view
  // Only inject initialData if params match default (page 1, etc.)
  const isDefaultProductsQuery =
    currentPage === 1 &&
    !searchQuery &&
    !selectedCategoryId &&
    !filters.minRating &&
    !activeScope &&
    filters.priceRange[0] === 0 &&
    filters.priceRange[1] === 5000;

  const { data: newProductsData, isLoading: newProductsLoading } =
    useGetPublicProducts(
      { ...discoveryParams, limit: 4, page: 1 },
      {
        enabled: listingType === 'all',
        initialData: isDefaultProductsQuery ? initialNewProducts : undefined,
      },
    );

  const { data: productsData, isLoading: productsLoading } =
    useGetPublicProducts(discoveryParams, {
      enabled: listingType === 'products',
    });
  const { data: servicesData, isLoading: servicesLoading } =
    useGetPublicServices(discoveryParams, {
      enabled: listingType === 'services',
    });
  const { data: vouchersData, isLoading: vouchersLoading } =
    useGetPublicVouchers(discoveryParams, {
      enabled: listingType === 'vouchers',
    });
  const { data: giftCardsData, isLoading: giftCardsLoading } =
    useGetPublicGiftCards(discoveryParams, {
      enabled: listingType === 'gift-cards',
    });
  const { data: couponsData, isLoading: couponsLoading } = useGetPublicCoupons(
    discoveryParams,
    { enabled: listingType === 'coupons' },
  );
  const { data: businessesData, isLoading: businessesLoading } =
    useGetPublicBusinesses(discoveryParams, {
      enabled: listingType === 'businesses',
    });

  const {
    data: promotionalOffersData,
    isLoading: promotionalOffersLoading,
  } = useGetPublicPromotionalOffers(
    {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchQuery.trim() || undefined,
    },
    { enabled: listingType === 'promotional' },
  );

  const { data: promotionalHighlights } = useGetPublicPromotionalOffers(
    {
      page: 1,
      limit: 5,
      search: searchQuery.trim() || undefined,
    },
    { enabled: listingType === 'all' },
  );

  // Approved affiliate products are part of the marketplace, not a separate
  // microsite. They only appear here when approved and published upstream.
  const affiliateParams = {
    q: searchQuery.trim() || undefined,
    categoryId: selectedCategoryId,
  };
  const { data: affiliateOffersData, isLoading: affiliateOffersLoading } =
    useGetPublicTakeadsOffers(
      {
        ...affiliateParams,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      },
      { enabled: listingType === 'affiliate' },
    );
  const { data: affiliateHighlights } = useGetPublicTakeadsOffers(
    { ...affiliateParams, page: 1, limit: 5 },
    { enabled: listingType === 'all' },
  );

  // Businesses matching the current query on the combined "All" search view.
  const { data: searchBusinessesData, isLoading: searchBusinessesLoading } =
    useGetPublicBusinesses(
      {
        page: 1,
        limit: 5,
        search: searchQuery.trim() || undefined,
        ...locationParams,
      },
      { enabled: listingType === 'all' && isSearching },
    );

  const featuredBusinesses: PublicBusiness[] = isSearching
    ? searchBusinessesData?.data || []
    : publicData?.businesses || [];

  // Resolve current data based on listing type
  const currentData = useMemo(() => {
    switch (listingType) {
      case 'products':
        return productsData;
      case 'services':
        return servicesData;
      case 'businesses':
        return businessesData;
      case 'vouchers':
        return vouchersData;
      case 'gift-cards':
        return giftCardsData;
      case 'coupons':
        return couponsData;
      default:
        return null; // 'all' handled separately
    }
  }, [
    listingType,
    productsData,
    servicesData,
    businessesData,
    vouchersData,
    giftCardsData,
    couponsData,
  ]);

  const isLoadingListings = useMemo(() => {
    switch (listingType) {
      case 'products':
        return productsLoading;
      case 'services':
        return servicesLoading;
      case 'businesses':
        return businessesLoading;
      case 'vouchers':
        return vouchersLoading;
      case 'gift-cards':
        return giftCardsLoading;
      case 'coupons':
        return couponsLoading;
      case 'promotional':
        return promotionalOffersLoading;
      case 'affiliate':
        return affiliateOffersLoading;
      case 'all':
        return isPublicDataLoading;
      default:
        return false;
    }
  }, [
    listingType,
    productsLoading,
    servicesLoading,
    businessesLoading,
    vouchersLoading,
    giftCardsLoading,
    couponsLoading,
    promotionalOffersLoading,
    affiliateOffersLoading,
    isPublicDataLoading,
  ]);

  // Helper to transform any item to PromotionalItem for ProductCard
  const mapToDisplayItem = (item: MarketItem, type: string) => {
    const title = item.title || item.name || 'Untitled';
    let price = item.price || item.amount || item.fixedAmounts?.[0] || 0;
    const image =
      item.imageUrl ||
      item.image ||
      item.url ||
      item.backgroundImage ||
      (item.media && item.media[0]) ||
      '/placeholder.png';
    const id = item.id;
    const category = item.category || type;

    if (type === 'products') {
      price = item.salePrice || item.price || 0;
    }

    let linkPrefix = 'products';
    if (type === 'services') linkPrefix = 'services';
    if (type === 'vouchers') linkPrefix = 'vouchers';
    if (type === 'gift-cards') linkPrefix = 'gift-cards';
    if (type === 'coupons') linkPrefix = 'coupons';

    return {
      id,
      title,
      price: Number(price),
      image,
      category: typeof category === 'string' ? category : 'General',
      items_left: (item as any).stock ?? 0,
      rating: 4.5,
      reviews: 10,
      discountedPrice: item.salePrice ? Number(item.salePrice) : undefined,
      link: `/${linkPrefix}/${id}`,
      bonusThreshold: (item as any).bonusThreshold,
      bonusAmount: (item as any).bonusAmount,
      fixedAmounts: (item as any).fixedAmounts,
      allowCustomAmount: (item as any).allowCustomAmount,
      minCustomAmount: (item as any).minCustomAmount,
      maxCustomAmount: (item as any).maxCustomAmount,
      fixedPrice: (item as any).fixedPrice,
      pricePerHour: (item as any).pricePerHour,
      basePrice: (item as any).basePrice,
      pricePerGuest: (item as any).pricePerGuest,
      additionalGuestPrice: (item as any).additionalGuestPrice,
      pricingModel: (item as any).pricingModel,
      pricingType: (item as any).pricingType,
      priceMax: (item as any).priceMax,
      expiryDays: (item as any).expiryDays || (item as any).expiry_days,
      expiryDate:
        (item as any).expiryDate ||
        (item as any).expiry_date ||
        (item as any).expiresAt ||
        (item as any).expires_at,
    } as PromotionalItem;
  };

  // Display Items for Single Category View
  const displayItems = useMemo(() => {
    if (
      listingType === 'all' ||
      listingType === 'businesses' ||
      !currentData?.data
    ) {
      return [];
    }
    return currentData.data.map((item) =>
      mapToDisplayItem(item as MarketItem, listingType),
    );
  }, [currentData, listingType]);

  const pageMeta: PageMetaDto | undefined =
    listingType === 'promotional'
      ? promotionalOffersData
        ? {
            totalItems: promotionalOffersData.total,
            itemCount: promotionalOffersData.data.length,
            itemsPerPage: promotionalOffersData.limit,
            totalPages: promotionalOffersData.totalPages,
            currentPage: promotionalOffersData.page,
            hasNextPage:
              promotionalOffersData.page < promotionalOffersData.totalPages,
            hasPreviousPage: promotionalOffersData.page > 1,
          }
        : undefined
      : listingType === 'affiliate'
        ? affiliateOffersData
          ? {
              totalItems: affiliateOffersData.total,
              itemCount: affiliateOffersData.data.length,
              itemsPerPage: affiliateOffersData.limit,
              totalPages: affiliateOffersData.totalPages,
              currentPage: affiliateOffersData.page,
              hasNextPage:
                affiliateOffersData.page < affiliateOffersData.totalPages,
              hasPreviousPage: affiliateOffersData.page > 1,
            }
          : undefined
        : currentData?.meta;
  const businessItems: PublicBusiness[] = businessesData?.data || [];
  const resultsCount =
    listingType === 'businesses'
      ? businessItems.length
      : listingType === 'promotional'
        ? promotionalOffersData?.total ?? 0
        : listingType === 'affiliate'
          ? affiliateOffersData?.total ?? 0
          : displayItems.length;

  // Sections Config Helper
  const getSection = (
    key: 'flashSale' | 'promoCarousel',
    snakeKey: 'flash_sale' | 'promo_carousel',
  ) => {
    const config = sections?.[key] || sections?.[snakeKey];
    if (!config) return null;
    return {
      ...config,
      isVisible: config.isVisible ?? config.is_visible ?? false,
      productIds: config.productIds || config.product_ids || [],
      products: config.products || [],
      title: config.title || '',
    };
  };

  const flashSaleConfig = getSection('flashSale', 'flash_sale');
  const promoCarouselConfig = getSection('promoCarousel', 'promo_carousel');

  const sidebarSlides = useMemo(() => {
    const slides: SidebarBanner[] = [];
    if (flashSaleConfig?.isVisible) {
      slides.push({
        id: 'flash-sale-main',
        type: 'flash_sale',
        title: flashSaleConfig.title || 'Flash Sale',
        subTitle: flashSaleConfig.config?.endTime
          ? `Ends: ${new Date(flashSaleConfig.config.endTime).toLocaleDateString()}`
          : 'Limited time offer',
        link: '/flash-sales',
        buttonText: 'Shop Deals',
        imageUrl: undefined,
        displayOrder: 0,
      } as SidebarBanner);
    }
    if (sidebarBanners && sidebarBanners.length > 0) {
      const safeBanners = sidebarBanners.map((b) => ({
        ...b,
        link: b.link || '#',
      }));
      slides.push(...safeBanners);
    }
    return slides;
  }, [flashSaleConfig, sidebarBanners]);

  const sidebarCategories = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map((c) => ({ name: c.name, count: undefined }));
    }
    return [];
  }, [apiCategories]);

  const brandStats = [
    { name: 'Samsung', count: 12 },
    { name: 'Apple', count: 8 },
    { name: 'Nike', count: 15 },
  ];

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (sidebarSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSidebarSlide((prev) => (prev + 1) % sidebarSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sidebarSlides.length]);

  const handlePrevSlide = () => {
    setActiveSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handleFilterChange = (newFilters: MarketplaceFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const renderBanner = (banner: SidebarBanner, index: number) => {
    const isFlash = banner.type === 'flash_sale';

    if (isFlash) {
      return (
        <div
          key={banner.id || index}
          className="w-full h-full bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-none relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
            <p className="text-red-100 mb-4">
              {banner.subTitle || banner.description}
            </p>
            <Link
              href={banner.link || '#'}
              className="text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-red-100"
            >
              {banner.buttonText || 'View All Deals'}
            </Link>
          </div>
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20 -z-0"
            />
          )}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
      );
    }

    if (banner.type === 'sidebar_banner') {
      return (
        <div
          key={banner.id || index}
          className="w-full h-full rounded-2xl shadow-none relative overflow-hidden group"
        >
          <Link
            href={banner.link || '#'}
            className="block w-full h-full relative"
          >
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title || 'Banner'}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </Link>
        </div>
      );
    }

    return (
      <div
        key={banner.id || index}
        className="w-full h-full bg-white rounded-2xl p-6 shadow-none relative overflow-hidden border border-gray-100"
      >
        {banner.imageUrl && (
          <img
            src={banner.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
        )}
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            {banner.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {banner.subTitle || banner.description}
          </p>
          <Button className="w-full" asChild>
            <Link href={banner.link || '#'}>
              {banner.buttonText || 'Explore'}
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  // Helper to render the appropriate card based on the listing type.
  // The explicit type is important: a product can legitimately be in a
  // category like "Financial Services", which must not turn it into a service
  // card. Category/link inference is only a fallback for legacy callers.
  const renderItemCard = (
    item: PromotionalItem,
    mode: 'grid' | 'list' = 'grid',
    listingTypeHint?: ListingType,
  ) => {
    const category = item.category?.toLowerCase() || '';
    const link = item.link || '';

    const resolvedType: ListingType | null =
      listingTypeHint && listingTypeHint !== 'all'
        ? listingTypeHint
        : category.includes('voucher') || link.includes('/vouchers/')
          ? 'vouchers'
          : category.includes('coupon') || link.includes('/coupons/')
            ? 'coupons'
            : category.includes('gift') || link.includes('/gift-cards/')
              ? 'gift-cards'
              : category.includes('service') || link.includes('/services/')
                ? 'services'
                : 'products';

    switch (resolvedType) {
      case 'vouchers':
      case 'coupons':
        return (
          <VoucherCard
            key={item.id}
            voucher={item}
            viewMode={mode}
            type={resolvedType}
          />
        );
      case 'gift-cards':
        return <GiftCardCard key={item.id} giftCard={item} viewMode={mode} />;
      case 'services':
        return <ServiceCard key={item.id} service={item} viewMode={mode} />;
      case 'products':
      default:
        return <ProductCard key={item.id} product={item} viewMode={mode} />;
    }
  };

  // Reusable Component for "All" View Sections
  const SectionRow = ({
    title,
    type,
    items,
    onSeeAll,
  }: {
    title: string;
    type: ListingType;
    items: MarketItem[];
    onSeeAll?: () => void;
  }) => {
    // Only render if items exist
    if (!items || items.length === 0) return null;
    const displayItems = items.map((item) => mapToDisplayItem(item, type));

    let href = '/marketplace';
    if (type === 'products') href = '/products';
    if (type === 'services') href = '/services';
    if (type === 'vouchers') href = '/vouchers';
    if (type === 'gift-cards') href = '/gift-cards';
    if (type === 'coupons') href = '/coupons';

    const seeAllClass =
      'text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1 group';

    return (
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
          {onSeeAll ? (
            <button type="button" onClick={onSeeAll} className={seeAllClass}>
              SEE ALL{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <Link href={href} className={seeAllClass}>
              SEE ALL{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {displayItems
              .slice(0, 5)
              .map((item) => renderItemCard(item, 'grid', type))}
          </div>
        </div>
      </div>
    );
  };

  // Businesses section for the "All" dashboard and combined search results.
  const BusinessRow = ({
    title,
    items,
    onSeeAll,
  }: {
    title: string;
    items: PublicBusiness[];
    onSeeAll?: () => void;
  }) => {
    if (!items || items.length === 0) return null;

    const openBusinesses = () => {
      setListingType('businesses');
      setCurrentPage(1);
    };

    return (
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onSeeAll || openBusinesses}
            className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1 group"
          >
            SEE ALL{' '}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {items
              .slice(0, 5)
              .map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  viewMode="grid"
                />
              ))}
          </div>
        </div>
      </div>
    );
  };

  // Promotional/affiliate offers are visually distinct from merchant stock.
  const PromotionalRow = ({
    title,
    offers,
    onSeeAll,
    subtitle,
  }: {
    title: string;
    offers: any[];
    onSeeAll?: () => void;
    subtitle?: string;
  }) => {
    if (!offers || offers.length === 0) return null;

    return (
      <div className="mb-6 overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50/60 p-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-sky-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="text-xs font-medium text-sky-700">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onSeeAll}
            className="group flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            SEE ALL{' '}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
            {offers
              .slice(0, 5)
              .map((offer) => (
                <ExternalOfferCard
                  key={offer.id}
                  offer={offer}
                  source="marketplace"
                  compact
                />
              ))}
          </div>
        </div>
      </div>
    );
  };

  const AffiliateRow = ({
    title,
    offers,
    onSeeAll,
    subtitle,
  }: {
    title: string;
    offers: PublicTakeadsOffer[];
    onSeeAll?: () => void;
    subtitle?: string;
  }) => {
    if (!offers.length) return null;

    return (
      <div className="mb-6 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="text-xs font-medium text-emerald-700">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onSeeAll}
            className="group flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            SEE ALL{' '}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
            {offers.slice(0, 5).map((offer) => (
              <TakeadsOfferCard
                key={offer.id}
                offer={offer}
                source="marketplace"
                compact
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f1f1f2] text-gray-900 selection:bg-orange-500 selection:text-white font-sans pt-20 pb-12">
      <div className="container relative z-10 mx-auto px-4">
        {/* 1. Hero Section */}
        {isPublicDataLoading && !publicData ? (
          <div className="h-[400px] w-full flex items-center justify-center bg-transparent rounded-2xl mb-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mb-4 w-full">
            <div className="relative w-full h-[220px] md:h-[340px] rounded-2xl overflow-hidden shadow-lg group bg-gray-900">
              {heroSlides.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0"
                    >
                      <div className="w-full h-full relative">
                        {heroSlides[activeSlide].imageUrl && (
                          <img
                            src={heroSlides[activeSlide].imageUrl}
                            alt={heroSlides[activeSlide].title || 'Hero slide'}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                          <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg"
                          >
                            {heroSlides[activeSlide].title}
                          </motion.h2>
                          <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm md:text-lg text-gray-300 font-medium max-w-xl"
                          >
                            {heroSlides[activeSlide].subTitle}
                          </motion.p>
                          {heroSlides[activeSlide].link ? (
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Button
                                className="mt-4 w-fit bg-orange-500 text-white hover:bg-orange-600 rounded-full px-6 py-3 text-sm font-bold shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                                asChild
                              >
                                <Link
                                  href={heroSlides[activeSlide].link || '#'}
                                >
                                  {heroSlides[activeSlide].buttonText ||
                                    'Shop Now'}{' '}
                                  <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                              </Button>
                            </motion.div>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevSlide();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextSlide();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlide(i);
                        }}
                        className={`transition-all duration-300 rounded-full ${
                          i === activeSlide
                            ? 'w-8 h-2.5 bg-orange-500'
                            : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No active slides
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search & Category Navigation */}
        <div className="mt-6 mb-4">
          <div className="relative max-w-2xl mx-auto mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products, services, businesses, vouchers..."
              className="pl-12 h-12 bg-white border-gray-200 rounded-full text-base focus-visible:ring-orange-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {[
              { key: 'all', label: 'All', icon: LayoutDashboard },
              { key: 'products', label: 'Products', icon: ShoppingBag },
              { key: 'services', label: 'Services', icon: Briefcase },
              { key: 'businesses', label: 'Businesses', icon: Store },
              { key: 'vouchers', label: 'Vouchers', icon: Ticket },
              { key: 'gift-cards', label: 'Gift Cards', icon: Gift },
              { key: 'coupons', label: 'Coupons', icon: Tag },
              { key: 'promotional', label: 'MCOM Offers', icon: BadgePercent },
              { key: 'affiliate', label: 'Affiliate', icon: BadgePercent },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setListingType(key as ListingType)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  listingType === key
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Location filter — sits with the type filters, like Amazon/Jumia */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <MarketplaceLocationPicker
              selection={locationSelection}
              resolved={resolvedLocation}
              isResolving={isResolvingLocation}
              onSelect={handleLocationSelect}
              onUseMyLocation={handleUseMyLocation}
            />
            {activeScope && (
              <button
                type="button"
                onClick={() =>
                  handleLocationSelect({
                    level: 'all',
                    name: 'All locations',
                  })
                }
                className="rounded-full px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-white hover:text-orange-600"
              >
                Clear location
              </button>
            )}
          </div>
        </div>

        {/* Trust Strip */}
        <div className="flex items-center justify-center gap-6 md:gap-10 py-3 mb-6 text-sm text-gray-500 bg-white rounded-xl px-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base">🚚</span>
            <span className="font-medium hidden sm:inline">Free Delivery</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span className="font-medium">Buyer Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">⭐</span>
            <span className="font-medium hidden sm:inline">
              Quality Assured
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-base">↩️</span>
            <span className="font-medium">Easy Returns</span>
          </div>
        </div>

        {/* 2. Main Layout Split */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <aside
            className={`${listingType === 'all' ? 'hidden' : 'hidden lg:block'} w-64 flex-shrink-0`}
          >
            <div className="sticky top-28 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              {/* Category / Type Selector */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Explore</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('all')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> All
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('products')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'products' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <ShoppingBag className="w-4 h-4" /> Products
                    </button>
                    {listingType === 'products' && (
                      <Link
                        href="/products"
                        className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline"
                      >
                        View All Products Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('services')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'services' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <Briefcase className="w-4 h-4" /> Services
                    </button>
                    {listingType === 'services' && (
                      <Link
                        href="/services"
                        className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline"
                      >
                        View All Services Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('businesses')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'businesses' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <Store className="w-4 h-4" /> Businesses
                    </button>
                    {listingType === 'businesses' && (
                      <p className="block w-full text-left pl-9 py-1 text-sm text-gray-500">
                        Search by business name
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('vouchers')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'vouchers' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <Ticket className="w-4 h-4" /> Vouchers
                    </button>
                    {listingType === 'vouchers' && (
                      <Link
                        href="/vouchers"
                        className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline"
                      >
                        View All Vouchers Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('gift-cards')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'gift-cards' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <Gift className="w-4 h-4" /> Gift Cards
                    </button>
                    {listingType === 'gift-cards' && (
                      <Link
                        href="/gift-cards"
                        className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline"
                      >
                        View All Gift Cards Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('coupons')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'coupons' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <Tag className="w-4 h-4" /> Coupons
                    </button>
                    {listingType === 'coupons' && (
                      <Link
                        href="/coupons"
                        className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline"
                      >
                        View All Coupons Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('promotional')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'promotional' ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <BadgePercent className="w-4 h-4" /> MCOM Offers
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setListingType('affiliate')}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'affiliate' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <BadgePercent className="w-4 h-4" /> Affiliate Products
                    </button>
                  </div>
                </div>
              </div>

              <MarketplaceSidebar
                categories={sidebarCategories}
                brands={brandStats}
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>
          </aside>

          {/* Right Content */}
          <main className="flex-1">
            {/* Top Toolbar - Only show when NOT in 'all' mode */}
            {listingType !== 'all' && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 sticky top-24 z-20">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`Search ${listingType.replace('-', ' ')}...`}
                      className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-primary"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="lg:hidden">
                      <Select
                        value={listingType}
                        onValueChange={(val) =>
                          setListingType(val as ListingType)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="businesses">Businesses</SelectItem>
                          <SelectItem value="vouchers">Vouchers</SelectItem>
                          <SelectItem value="gift-cards">Gift Cards</SelectItem>
                          <SelectItem value="coupons">Coupons</SelectItem>
                          <SelectItem value="promotional">
                            MCOM Offers
                          </SelectItem>
                          <SelectItem value="affiliate">
                            Affiliate Products
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">New Arrivals</SelectItem>
                        <SelectItem value="price-asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price: High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <ListIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <p>
                    Showing{' '}
                    <span className="font-semibold text-gray-900">
                      {resultsCount}
                    </span>{' '}
                    results for{' '}
                    <span className="font-semibold text-primary capitalize">
                      {listingType.replace('-', ' ')}
                    </span>
                    {activeScope && (
                      <>
                        {' '}in{' '}
                        <span className="font-semibold text-gray-900">
                          {activeScope.name}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Content Logic */}
            {listingType === 'all' ? (
              isSearching ? (
                // Combined search view so a business name is findable from
                // the global search without switching tabs first.
                <div className="space-y-8">
                  <BusinessRow
                    title={`Businesses matching “${searchQuery}”`}
                    items={featuredBusinesses}
                  />
                  <SectionRow
                    title={`Products matching “${searchQuery}”`}
                    type="products"
                    items={newProductsData?.data || []}
                    onSeeAll={() => {
                      setListingType('products');
                      setCurrentPage(1);
                    }}
                  />

                  <PromotionalRow
                    title={`MCOM offers matching “${searchQuery}”`}
                    subtitle="Claimed and promoted by local businesses"
                    offers={promotionalHighlights?.data || []}
                    onSeeAll={() => {
                      setListingType('promotional');
                      setCurrentPage(1);
                    }}
                  />

                  <AffiliateRow
                    title={`Affiliate products matching “${searchQuery}”`}
                    subtitle="Selected national-brand offers from approved merchants"
                    offers={affiliateHighlights?.data || []}
                    onSeeAll={() => {
                      setListingType('affiliate');
                      setCurrentPage(1);
                    }}
                  />

                  {!searchBusinessesLoading &&
                    !newProductsLoading &&
                    featuredBusinesses.length === 0 &&
                    (newProductsData?.data?.length ?? 0) === 0 &&
                    (promotionalHighlights?.data?.length ?? 0) === 0 &&
                    (affiliateHighlights?.data?.length ?? 0) === 0 && (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          No results for “{searchQuery}”
                        </h3>
                        <p className="text-gray-500">
                          Try a different spelling or search the business
                          directory directly.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                          <Button
                            onClick={() => {
                              setListingType('businesses');
                              setCurrentPage(1);
                            }}
                          >
                            Search businesses
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                          >
                            Clear search
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                // Dashboard View (Sections)
                <div className="space-y-12">
                  {/* Dynamic Sections (Flash Sale / Promo) */}
                  {flashSaleConfig?.isVisible &&
                    (flashSaleConfig.products ||
                      flashSaleConfig.productIds) && (
                      <MarketplaceSection
                        title={flashSaleConfig.title}
                        productIds={flashSaleConfig.productIds}
                        products={flashSaleConfig.products}
                      />
                    )}
                  {promoCarouselConfig?.isVisible &&
                    (promoCarouselConfig.products ||
                      promoCarouselConfig.productIds) && (
                      <MarketplaceSection
                        title={promoCarouselConfig.title}
                        productIds={promoCarouselConfig.productIds}
                        products={promoCarouselConfig.products}
                      />
                    )}

                  {/* Main Sections */}
                  <BusinessRow
                    title="Featured Businesses"
                    items={publicData?.businesses || []}
                  />
                  <SectionRow
                    title="Featured Products"
                    type="products"
                    items={publicData?.products || []}
                  />
                  <SectionRow
                    title="Featured Services"
                    type="services"
                    items={publicData?.services || []}
                  />
                  <PromotionalRow
                    title="MCOM Promotional Offers"
                    subtitle="External products and services claimed and promoted by local businesses"
                    offers={promotionalHighlights?.data || []}
                    onSeeAll={() => {
                      setListingType('promotional');
                      setCurrentPage(1);
                    }}
                  />
                  <AffiliateRow
                    title="Affiliate Products"
                    subtitle="Approved national-brand offers. Buying redirects to the merchant."
                    offers={affiliateHighlights?.data || []}
                    onSeeAll={() => {
                      setListingType('affiliate');
                      setCurrentPage(1);
                    }}
                  />
                  <SectionRow
                    title="Newest Vouchers"
                    type="vouchers"
                    items={publicData?.vouchers || []}
                  />
                  <SectionRow
                    title="Gift Cards"
                    type="gift-cards"
                    items={publicData?.giftCards || []}
                  />
                  <SectionRow
                    title="Latest Coupons"
                    type="coupons"
                    items={publicData?.coupons || []}
                  />

                  {!publicData?.products?.length &&
                    !publicData?.services?.length &&
                    !publicData?.businesses?.length &&
                    !publicData?.vouchers?.length &&
                    !publicData?.giftCards?.length &&
                    !publicData?.coupons?.length &&
                    !(promotionalHighlights?.data?.length ?? 0) &&
                    !(affiliateHighlights?.data?.length ?? 0) &&
                    !isPublicDataLoading && (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          No items found
                        </h3>
                        <p className="text-gray-500">
                          {activeScope
                            ? `No featured items in ${activeScope.name}.`
                            : filters.categories.length > 0
                              ? 'No items found in this category.'
                              : 'No featured items available right now.'}
                        </p>
                        <Button
                          variant="link"
                          className="mt-2 text-primary"
                          onClick={() => {
                            handleFilterChange({
                              ...filters,
                              categories: [],
                            });
                            if (activeScope) {
                              handleLocationSelect({
                                level: 'all',
                                name: 'All locations',
                              });
                            }
                          }}
                        >
                          {activeScope
                            ? 'Show all locations'
                            : 'Clear filters'}
                        </Button>
                      </div>
                    )}
                </div>
              )
            ) : (
              // Discovery View (Paginated Grid)
              <>
                {isLoadingListings ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-64 md:h-80 bg-white rounded-xl shadow-sm animate-pulse"
                      />
                    ))}
                  </div>
                ) : (listingType === 'businesses'
                    ? businessItems.length
                    : listingType === 'promotional'
                      ? promotionalOffersData?.data.length ?? 0
                      : listingType === 'affiliate'
                        ? affiliateOffersData?.data.length ?? 0
                        : displayItems.length) > 0 ? (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {listingType === 'businesses'
                      ? businessItems.map((business) => (
                          <BusinessCard
                            key={business.id}
                            business={business}
                            viewMode={viewMode}
                          />
                        ))
                      : listingType === 'promotional'
                        ? (promotionalOffersData?.data || []).map((offer) => (
                            <ExternalOfferCard
                              key={offer.id}
                              offer={offer}
                              source="marketplace"
                            />
                          ))
                        : listingType === 'affiliate'
                          ? (affiliateOffersData?.data || []).map((offer) => (
                              <TakeadsOfferCard
                                key={offer.id}
                                offer={offer}
                                source="marketplace"
                              />
                            ))
                          : displayItems.map((item) =>
                              renderItemCard(item, viewMode, listingType),
                            )}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      No {listingType.replace('-', ' ')} found
                    </h3>
                    <p className="text-gray-500">
                      {activeScope
                        ? `No ${listingType.replace('-', ' ')} found in ${activeScope.name}.`
                        : filters.categories.length > 0
                          ? 'No results in this category.'
                          : 'Try adjusting your search or filters.'}
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 text-primary"
                      onClick={() => {
                        setSearchQuery('');
                        handleFilterChange({ ...filters, categories: [] });
                        if (activeScope) {
                          handleLocationSelect({
                            level: 'all',
                            name: 'All locations',
                          });
                        }
                      }}
                    >
                      {activeScope ? 'Show all locations' : 'Clear all filters'}
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {pageMeta && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pageMeta.currentPage}
                      totalPages={pageMeta.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
