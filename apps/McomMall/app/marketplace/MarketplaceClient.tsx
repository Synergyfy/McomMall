'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketplaceSidebar, { MarketplaceFiltersState } from '@/components/marketplace/MarketplaceSidebar';
import ProductCard from '@/components/marketplace/ProductCard';
import VoucherCard from '@/components/marketplace/VoucherCard';
import GiftCardCard from '@/components/marketplace/GiftCardCard';
import ServiceCard from '@/components/marketplace/ServiceCard';
import Pagination from '@/components/marketplace/Pagination';
import MarketplaceSection from '@/components/marketplace/MarketplaceSection';
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
  useGetPublicProducts,
  useGetPublicServices,
  useGetPublicVouchers,
  useGetPublicGiftCards,
  useGetPublicCoupons
} from '@/service/marketplace/discovery';
import { SidebarBanner, PageMetaDto, MarketplacePublicData, PageDto } from '@/service/marketplace/types';
import { PromotionalItem } from '@/lib/listing-data';
import { Product } from '@/service/listings/types';

const ITEMS_PER_PAGE = 12;

type ListingType = 'all' | 'products' | 'services' | 'vouchers' | 'gift-cards' | 'coupons';

type MarketItem = {
  id?: string | number;
  title?: string;
  name?: string;
  price?: number | string;
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

interface MarketplaceClientProps {
  initialPublicData?: MarketplacePublicData;
  initialNewProducts?: PageDto<Product>;
}

export default function MarketplaceClient({ initialPublicData, initialNewProducts }: MarketplaceClientProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSidebarSlide, setActiveSidebarSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listingType, setListingType] = useState<ListingType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MarketplaceFiltersState>({
    categories: [],
    priceRange: [0, 5000],
    brands: [],
    minRating: null,
  });

  // Data Fetching: Landing Page
  const { data: publicData, isLoading: isPublicDataLoading } = useGetMarketplacePublic({ initialData: initialPublicData });

  const heroSlides = useMemo(() => publicData?.heroSlides || [], [publicData]);
  const sidebarBanners = useMemo(() => publicData?.sidebarBanners || [], [publicData]);
  const apiCategories = useMemo(() => publicData?.categories || [], [publicData]);
  const sections = useMemo(() => publicData?.sections || {}, [publicData]);

  // Resolve Category ID from Selection
  const selectedCategoryId = useMemo(() => {
    if (filters.categories.length === 0) return undefined;
    // Assuming single category selection for now or taking the first one
    const selectedName = filters.categories[0];
    const categoryObj = apiCategories.find(c => c.name === selectedName);
    return categoryObj?.targetCategoryId;
  }, [filters.categories, apiCategories]);

  // Data Fetching: Discovery
  const discoveryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    // Only pass category if we have a valid resolved UUID.
    // If user selected a name but ID isn't found, we don't filter (fallback) to avoid empty grid on mismatch.
    category: selectedCategoryId || undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
  };

  // Fetch "New Products" specifically for the "All" view
  // Only inject initialData if params match default (page 1, etc.)
  const isDefaultProductsQuery = currentPage === 1 && !searchQuery && !selectedCategoryId && !filters.minRating && filters.priceRange[0] === 0 && filters.priceRange[1] === 5000;

  const { data: newProductsData } = useGetPublicProducts(
    { ...discoveryParams, limit: 4, page: 1 },
    {
      enabled: listingType === 'all',
      initialData: isDefaultProductsQuery ? initialNewProducts : undefined
    }
  );

  const { data: productsData, isLoading: productsLoading } = useGetPublicProducts(discoveryParams, { enabled: listingType === 'products' });
  const { data: servicesData, isLoading: servicesLoading } = useGetPublicServices(discoveryParams, { enabled: listingType === 'services' });
  const { data: vouchersData, isLoading: vouchersLoading } = useGetPublicVouchers(discoveryParams, { enabled: listingType === 'vouchers' });
  const { data: giftCardsData, isLoading: giftCardsLoading } = useGetPublicGiftCards(discoveryParams, { enabled: listingType === 'gift-cards' });
  const { data: couponsData, isLoading: couponsLoading } = useGetPublicCoupons(discoveryParams, { enabled: listingType === 'coupons' });

  // Resolve current data based on listing type
  const currentData = useMemo(() => {
    switch (listingType) {
      case 'products': return productsData;
      case 'services': return servicesData;
      case 'vouchers': return vouchersData;
      case 'gift-cards': return giftCardsData;
      case 'coupons': return couponsData;
      default: return null; // 'all' handled separately
    }
  }, [listingType, productsData, servicesData, vouchersData, giftCardsData, couponsData]);

  const isLoadingListings = useMemo(() => {
    switch (listingType) {
      case 'products': return productsLoading;
      case 'services': return servicesLoading;
      case 'vouchers': return vouchersLoading;
      case 'gift-cards': return giftCardsLoading;
      case 'coupons': return couponsLoading;
      case 'all': return isPublicDataLoading;
      default: return false;
    }
  }, [listingType, productsLoading, servicesLoading, vouchersLoading, giftCardsLoading, couponsLoading, isPublicDataLoading]);

  // Helper to transform any item to PromotionalItem for ProductCard
  const mapToDisplayItem = (item: MarketItem, type: string) => {
    const title = item.title || item.name || 'Untitled';
    let price = item.price || item.amount || item.fixedAmounts?.[0] || 0;
    const image = item.imageUrl || item.image || item.url || item.backgroundImage || (item.media && item.media[0]) || '/placeholder.png';
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
      expiryDays: (item as any).expiryDays || (item as any).expiry_days,
      expiryDate: (item as any).expiryDate || (item as any).expiry_date || (item as any).expiresAt || (item as any).expires_at,
    } as PromotionalItem;
  };

  // Display Items for Single Category View
  const displayItems = useMemo(() => {
    if (listingType === 'all' || !currentData?.data) return [];
    return currentData.data.map((item: MarketItem) => mapToDisplayItem(item, listingType));
  }, [currentData, listingType]);

  const pageMeta: PageMetaDto | undefined = currentData?.meta;

  // Sections Config Helper
  const getSection = (key: 'flashSale' | 'promoCarousel', snakeKey: 'flash_sale' | 'promo_carousel') => {
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
        displayOrder: 0
      } as SidebarBanner);
    }
    if (sidebarBanners && sidebarBanners.length > 0) {
      const safeBanners = sidebarBanners.map(b => ({
        ...b,
        link: b.link || '#'
      }));
      slides.push(...safeBanners);
    }
    return slides;
  }, [flashSaleConfig, sidebarBanners]);

  const sidebarCategories = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map(c => ({ name: c.name, count: undefined }));
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
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handleFilterChange = (newFilters: MarketplaceFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const renderBanner = (banner: SidebarBanner, index: number) => {
    const isFlash = banner.type === 'flash_sale';

    if (isFlash) {
      return (
        <div key={banner.id || index} className="w-full h-full bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-none relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
            <p className="text-red-100 mb-4">{banner.subTitle || banner.description}</p>
            <Link href={banner.link || '#'} className="text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-red-100">
              {banner.buttonText || 'View All Deals'}
            </Link>
          </div>
          {banner.imageUrl && (
            <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 -z-0" />
          )}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
      );
    }

    if (banner.type === 'sidebar_banner') {
      return (
        <div key={banner.id || index} className="w-full h-full rounded-2xl shadow-none relative overflow-hidden group">
          <Link href={banner.link || '#'} className="block w-full h-full relative">
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title || "Banner"}
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
      <div key={banner.id || index} className="w-full h-full bg-white rounded-2xl p-6 shadow-none relative overflow-hidden border border-gray-100">
        {banner.imageUrl && (
          <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        )}
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2 text-gray-900">{banner.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{banner.subTitle || banner.description}</p>
          <Button className="w-full" asChild>
            <Link href={banner.link || '#'}>{banner.buttonText || 'Explore'}</Link>
          </Button>
        </div>
      </div>
    );
  };

  // Helper to render the appropriate card based on item type
  const renderItemCard = (item: PromotionalItem, mode: 'grid' | 'list' = 'grid') => {
    const category = item.category?.toLowerCase() || '';
    const link = item.link || '';

    // Detect item type and render appropriate card
    if (category.includes('voucher') || link.includes('/vouchers/') || category.includes('coupon') || link.includes('/coupons/')) {
      const type = (category.includes('coupon') || link.includes('/coupons/')) ? 'coupons' : 'vouchers';
      return <VoucherCard key={item.id} voucher={item} viewMode={mode} type={type} />;
    }

    if (category.includes('gift') || link.includes('/gift-cards/')) {
      return <GiftCardCard key={item.id} giftCard={item} viewMode={mode} />;
    }

    if (category.includes('service') || link.includes('/services/')) {
      return <ServiceCard key={item.id} service={item} viewMode={mode} />;
    }

    // Default to ProductCard
    return <ProductCard key={item.id} product={item} viewMode={mode} />;
  };

  // Reusable Component for "All" View Sections
  const SectionRow = ({ title, type, items }: { title: string, type: ListingType, items: MarketItem[] }) => {
    // Only render if items exist
    if (!items || items.length === 0) return null;
    const displayItems = items.map(item => mapToDisplayItem(item, type));

    let href = '/marketplace';
    if (type === 'products') href = '/products';
    if (type === 'services') href = '/services';
    if (type === 'vouchers') href = '/vouchers';
    if (type === 'gift-cards') href = '/gift-cards';
    if (type === 'coupons') href = '/coupons';

    return (
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <Link href={href} className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1 group">
            SEE ALL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {displayItems.slice(0, 5).map((item) => renderItemCard(item, 'grid'))}
          </div>
        </div>
      </div>
    );
  }

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
                            alt={heroSlides[activeSlide].title || "Hero slide"}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                          <motion.h2 initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{heroSlides[activeSlide].title}</motion.h2>
                          <motion.p initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: 0.1}} className="text-sm md:text-lg text-gray-300 font-medium max-w-xl">{heroSlides[activeSlide].subTitle}</motion.p>
                          {heroSlides[activeSlide].link ? (
                            <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: 0.2}}>
                              <Button className="mt-4 w-fit bg-orange-500 text-white hover:bg-orange-600 rounded-full px-6 py-3 text-sm font-bold shadow-lg shadow-orange-500/25 transition-all hover:scale-105" asChild>
                                <Link href={heroSlides[activeSlide].link || '#'}>
                                  {heroSlides[activeSlide].buttonText || 'Shop Now'} <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                              </Button>
                            </motion.div>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <button onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleNextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
                        className={`transition-all duration-300 rounded-full ${
                          i === activeSlide ? 'w-8 h-2.5 bg-orange-500' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No active slides</div>
              )}
            </div>
          </div>
        )}

        {/* Search & Category Navigation */}
        <div className="mt-6 mb-4">
          <div className="relative max-w-2xl mx-auto mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products, services, vouchers..."
              className="pl-12 h-12 bg-white border-gray-200 rounded-full text-base focus-visible:ring-orange-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {[
              { key: 'all', label: 'All', icon: LayoutDashboard },
              { key: 'products', label: 'Products', icon: ShoppingBag },
              { key: 'services', label: 'Services', icon: Briefcase },
              { key: 'vouchers', label: 'Vouchers', icon: Ticket },
              { key: 'gift-cards', label: 'Gift Cards', icon: Gift },
              { key: 'coupons', label: 'Coupons', icon: Tag },
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
            <span className="font-medium hidden sm:inline">Quality Assured</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-base">↩️</span>
            <span className="font-medium">Easy Returns</span>
          </div>
        </div>

        {/* 2. Main Layout Split */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar */}
          <aside className={`${listingType === 'all' ? 'hidden' : 'hidden lg:block'} w-64 flex-shrink-0`}>
            <div className="sticky top-28 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              {/* Category / Type Selector */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Explore</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <button onClick={() => setListingType('all')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <LayoutDashboard className="w-4 h-4" /> All
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button onClick={() => setListingType('products')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'products' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <ShoppingBag className="w-4 h-4" /> Products
                    </button>
                    {listingType === 'products' && (
                      <Link href="/products" className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline">
                        View All Products Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button onClick={() => setListingType('services')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'services' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <Briefcase className="w-4 h-4" /> Services
                    </button>
                    {listingType === 'services' && (
                      <Link href="/services" className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline">
                        View All Services Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button onClick={() => setListingType('vouchers')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'vouchers' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <Ticket className="w-4 h-4" /> Vouchers
                    </button>
                    {listingType === 'vouchers' && (
                      <Link href="/vouchers" className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline">
                        View All Vouchers Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button onClick={() => setListingType('gift-cards')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'gift-cards' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <Gift className="w-4 h-4" /> Gift Cards
                    </button>
                    {listingType === 'gift-cards' && (
                      <Link href="/gift-cards" className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline">
                        View All Gift Cards Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button onClick={() => setListingType('coupons')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'coupons' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <Tag className="w-4 h-4" /> Coupons
                    </button>
                    {listingType === 'coupons' && (
                      <Link href="/coupons" className="block w-full text-left pl-9 py-1 text-sm text-primary hover:underline">
                        View All Coupons Page
                      </Link>
                    )}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="lg:hidden">
                      <Select value={listingType} onValueChange={(val) => setListingType(val as ListingType)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="vouchers">Vouchers</SelectItem>
                          <SelectItem value="gift-cards">Gift Cards</SelectItem>
                          <SelectItem value="coupons">Coupons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">New Arrivals</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                        <ListIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <p>Showing <span className="font-semibold text-gray-900">{displayItems.length}</span> results for <span className="font-semibold text-primary capitalize">{listingType.replace('-', ' ')}</span></p>
                </div>
              </div>
            )}

            {/* Content Logic */}
            {listingType === 'all' ? (
              // Dashboard View (Sections)
              <div className="space-y-12">
                {/* Dynamic Sections (Flash Sale / Promo) */}
                {flashSaleConfig?.isVisible && (flashSaleConfig.products || flashSaleConfig.productIds) && (
                  <MarketplaceSection
                    title={flashSaleConfig.title}
                    productIds={flashSaleConfig.productIds}
                    products={flashSaleConfig.products}
                  />
                )}
                {promoCarouselConfig?.isVisible && (promoCarouselConfig.products || promoCarouselConfig.productIds) && (
                  <MarketplaceSection
                    title={promoCarouselConfig.title}
                    productIds={promoCarouselConfig.productIds}
                    products={promoCarouselConfig.products}
                  />
                )}

                {/* Main Sections */}
                <SectionRow title="Featured Products" type="products" items={publicData?.products || []} />
                <SectionRow title="Featured Services" type="services" items={publicData?.services || []} />
                <SectionRow title="Newest Vouchers" type="vouchers" items={publicData?.vouchers || []} />
                <SectionRow title="Gift Cards" type="gift-cards" items={publicData?.giftCards || []} />
                <SectionRow title="Latest Coupons" type="coupons" items={publicData?.coupons || []} />

                {(!publicData?.products?.length && !publicData?.services?.length && !publicData?.vouchers?.length && !publicData?.giftCards?.length && !publicData?.coupons?.length) && !isPublicDataLoading && (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No items found</h3>
                    <p className="text-gray-500">
                      {filters.categories.length > 0 ? "No items found in this category." : "No featured items available right now."}
                    </p>
                    <Button variant="link" className="mt-2 text-primary" onClick={() => handleFilterChange({ ...filters, categories: [] })}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Discovery View (Paginated Grid)
              <>
                {isLoadingListings ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-64 md:h-80 bg-white rounded-xl shadow-sm animate-pulse" />
                    ))}
                  </div>
                ) : displayItems.length > 0 ? (
                  <div className={
                    viewMode === 'grid'
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4"
                      : "flex flex-col gap-4"
                  }>
                    {displayItems.map((item) => renderItemCard(item, viewMode))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No {listingType.replace('-', ' ')} found</h3>
                    <p className="text-gray-500">
                      {filters.categories.length > 0 ? "No results in this category." : "Try adjusting your search or filters."}
                    </p>
                    <Button variant="link" className="mt-2 text-primary" onClick={() => {
                      setSearchQuery('');
                      handleFilterChange({ ...filters, categories: [] });
                    }}>
                      Clear all filters
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
