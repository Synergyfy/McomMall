'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketplaceSidebar, { MarketplaceFiltersState } from '@/components/marketplace/MarketplaceSidebar';
import ProductCard from '@/components/marketplace/ProductCard';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetMarketplacePublic } from '@/service/marketplace/hook';
import {
  useGetPublicProducts,
  useGetPublicServices,
  useGetPublicVouchers,
  useGetPublicGiftCards,
  useGetPublicCoupons
} from '@/service/marketplace/discovery';
import { SidebarBanner, PageMetaDto } from '@/service/marketplace/types';
import { PromotionalItem } from '@/lib/listing-data';

const ITEMS_PER_PAGE = 12;

type ListingType = 'products' | 'services' | 'vouchers' | 'gift-cards' | 'coupons';

export default function MarketplacePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSidebarSlide, setActiveSidebarSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listingType, setListingType] = useState<ListingType>('products');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data Fetching: Landing Page
  const { data: publicData, isLoading: isPublicDataLoading } = useGetMarketplacePublic();

  const heroSlides = useMemo(() => publicData?.heroSlides || [], [publicData]);
  const sidebarBanners = useMemo(() => publicData?.sidebarBanners || [], [publicData]);
  const apiCategories = useMemo(() => publicData?.categories || [], [publicData]);
  const sections = useMemo(() => publicData?.sections || {}, [publicData]);

  // Data Fetching: Discovery
  // We use a common params object. Note: Sort options are not fully supported by the API types yet (assuming newest first by default).
  const discoveryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    // Add other filters here when ready
  };

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
      default: return productsData;
    }
  }, [listingType, productsData, servicesData, vouchersData, giftCardsData, couponsData]);

  const isLoadingListings = useMemo(() => {
    switch (listingType) {
      case 'products': return productsLoading;
      case 'services': return servicesLoading;
      case 'vouchers': return vouchersLoading;
      case 'gift-cards': return giftCardsLoading;
      case 'coupons': return couponsLoading;
      default: return false;
    }
  }, [listingType, productsLoading, servicesLoading, vouchersLoading, giftCardsLoading, couponsLoading]);

  // Map API data to Display Items for ProductCard
  const displayItems = useMemo(() => {
    if (!currentData?.data) return [];

    return currentData.data.map((item: any) => {
      // Common shape mapping
      let title = item.title || item.name || 'Untitled';
      let price = item.price || item.amount || item.fixedAmounts?.[0] || 0;
      let image = item.imageUrl || item.image || item.url || item.backgroundImage || '/placeholder.png';
      let id = item.id;
      let category = item.category || listingType;

      // Type specific adjustments
      if (listingType === 'products') {
        price = item.salePrice || item.price || 0;
      }

      return {
        id,
        title,
        price: Number(price),
        image,
        category: typeof category === 'string' ? category : 'General',
        // Add fake promotional item fields to satisfy ProductCard for now
        items_left: 10,
        rating: 4.5,
        reviews: 10,
        discountedPrice: item.salePrice ? Number(item.salePrice) : undefined
      } as PromotionalItem;
    });
  }, [currentData, listingType]);

  const pageMeta: PageMetaDto | undefined = currentData?.meta;


  // Helper to handle both camelCase (API docs) and snake_case
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

  // Combine Flash Sale and Banners for the sidebar slider
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

  // Filter State
  const [filters, setFilters] = useState<MarketplaceFiltersState>({
    categories: [],
    priceRange: [0, 5000],
    brands: [],
    minRating: null,
  });

  // Derived Sidebar Categories
  const sidebarCategories = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map(c => ({ name: c.name, count: undefined }));
    }
    return [];
  }, [apiCategories]);

  // Mock Brands (placeholder)
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
    // TODO: Pass these filters to the discovery hooks when backend supports them fully
  };

  const renderBanner = (banner: SidebarBanner, index: number) => {
    const isFlash = banner.type === 'flash_sale';
    const isPromo = banner.type === 'sell_promo';

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
                 <Image src={banner.imageUrl} alt="" fill className="object-cover opacity-20 -z-0" />
            )}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
      );
    }

    // ... (Other banner types similar to original)
    if (banner.type === 'sidebar_banner') {
        return (
            <div key={banner.id || index} className="w-full h-full rounded-2xl shadow-none relative overflow-hidden group">
                <Link href={banner.link || '#'} className="block w-full h-full relative">
                    {banner.imageUrl ? (
                        <Image
                            src={banner.imageUrl}
                            alt={banner.title || "Banner"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                 <Image src={banner.imageUrl} alt="" fill className="object-cover opacity-10" />
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

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-4">
        
        {/* 1. Hero Section */}
        {isPublicDataLoading && !publicData ? (
             <div className="h-[400px] w-full flex items-center justify-center bg-white rounded-2xl shadow-sm mb-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        ) : (
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl group bg-gray-200">
            {heroSlides.length > 0 ? (
                <>
                <AnimatePresence mode="wait">
                <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div className="w-full h-full relative">
                        {heroSlides[activeSlide].imageUrl && (
                             <Image
                                src={heroSlides[activeSlide].imageUrl}
                                alt={heroSlides[activeSlide].title || "Hero slide"}
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                            <h2 className="text-4xl font-bold text-white mb-2">{heroSlides[activeSlide].title}</h2>
                            <p className="text-xl text-gray-200">{heroSlides[activeSlide].subTitle}</p>
                            {heroSlides[activeSlide].link ? (
                                <Button className="mt-4 w-fit bg-white text-black hover:bg-gray-100" asChild>
                                    <Link href={heroSlides[activeSlide].link || '#'}>
                                        {heroSlides[activeSlide].buttonText || 'Shop Now'}
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
                </AnimatePresence>
                {/* Navigation Arrows */}
                <button onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleNextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight className="h-6 w-6" />
                </button>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No active slides</div>
            )}
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl bg-gray-100 group/sidebar">
             {sidebarSlides.length > 0 ? (
                <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSidebarSlide}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      {renderBanner(sidebarSlides[activeSidebarSlide], activeSidebarSlide)}
                    </motion.div>
                  </AnimatePresence>
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">No promotions</div>
             )}
          </div>
        </div>
        )}

        {/* 1.5. Dynamic Sections (Flash Sale / Promo) */}
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

        {/* 1.6 Additional Discovery Teasers (Optional: Can render small strips here if needed) */}


        {/* 2. Main Layout Split */}
        <div className="flex flex-col lg:flex-row gap-8 mt-12">
          
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
             <div className="sticky top-28 space-y-8">
                {/* Category / Type Selector in Sidebar */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Explore</h3>
                    <div className="space-y-2">
                        <button onClick={() => setListingType('products')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'products' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                            <ShoppingBag className="w-4 h-4" /> Products
                        </button>
                        <button onClick={() => setListingType('services')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'services' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                            <Briefcase className="w-4 h-4" /> Services
                        </button>
                        <button onClick={() => setListingType('vouchers')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'vouchers' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                            <Ticket className="w-4 h-4" /> Vouchers
                        </button>
                        <button onClick={() => setListingType('gift-cards')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'gift-cards' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                            <Gift className="w-4 h-4" /> Gift Cards
                        </button>
                        <button onClick={() => setListingType('coupons')} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${listingType === 'coupons' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                            <Tag className="w-4 h-4" /> Coupons
                        </button>
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
            
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 sticky top-24 z-20">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search Bar */}
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
                   {/* Mobile Type Selector (Visible only on small screens) */}
                   <div className="lg:hidden">
                       <Select value={listingType} onValueChange={(val) => setListingType(val as ListingType)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
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
              
              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <p>Showing <span className="font-semibold text-gray-900">{displayItems.length}</span> results for <span className="font-semibold text-primary capitalize">{listingType.replace('-', ' ')}</span></p>
              </div>
            </div>

            {/* Content Grid */}
            {isLoadingListings ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-80 bg-white rounded-xl shadow-sm animate-pulse" />
                    ))}
                 </div>
            ) : displayItems.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "flex flex-col gap-4"
              }>
                {displayItems.map((item) => (
                  <ProductCard key={item.id} product={item} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No {listingType.replace('-', ' ')} found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-primary"
                  onClick={() => {
                    setSearchQuery('');
                  }}
                >
                  Clear search
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

          </main>
        </div>
      </div>
    </div>
  );
}
