'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { promotionalItems, PromotionalItem } from '@/lib/listing-data';
import MarketplaceSidebar, { MarketplaceFiltersState } from '@/components/marketplace/MarketplaceSidebar';
import ProductCard from '@/components/marketplace/ProductCard';
import PromoCarousel from '@/components/marketplace/PromoCarousel';
import Pagination from '@/components/marketplace/Pagination';
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
import { SidebarBanner } from '@/service/marketplace/types';

// --- Extended Mock Data for Pagination Demo ---
const generateMoreItems = (baseItems: PromotionalItem[], count: number): PromotionalItem[] => {
  const newItems = [];
  for (let i = 0; i < count; i++) {
    const base = baseItems[i % baseItems.length];
    // Use deterministic math instead of Math.random() to prevent hydration mismatches
    const pseudoRandom = ((i * 9301 + 49297) % 233280) / 233280;

    newItems.push({
      ...base,
      id: 1000 + i,
      title: `${base.title} ${i + 1}`,
      price: base.price + (pseudoRandom * 50 - 25),
      items_left: Math.floor(pseudoRandom * 50),
      // Randomize category slightly for filtering demo
      category: i % 3 === 0 ? 'Fashion' : i % 3 === 1 ? 'Electronics' : base.category,
    });
  }
  return [...baseItems, ...newItems];
};

const allProducts = generateMoreItems(promotionalItems, 40);

const ITEMS_PER_PAGE = 12;

export default function MarketplacePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data Fetching
  const { data: publicData, isLoading: isPublicDataLoading } = useGetMarketplacePublic();

  const heroSlides = publicData?.heroSlides || [];
  const sidebarBanners = publicData?.sidebarBanners || [];
  const apiCategories = publicData?.categories || [];
  const sections = publicData?.sections || {};

  // Filter State
  const [filters, setFilters] = useState<MarketplaceFiltersState>({
    categories: [],
    priceRange: [0, 5000],
    brands: [],
    minRating: null,
  });

  // Derived Data (Categories & Brands for Sidebar)
  const sidebarCategories = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map(c => ({ name: c.name, count: undefined }));
    }
    // Fallback to mock stats
    const stats: Record<string, number> = {};
    allProducts.forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [apiCategories]);

  // Mock Brands
  const brandStats = [
    { name: 'Samsung', count: 12 },
    { name: 'Apple', count: 8 },
    { name: 'Nike', count: 15 },
    { name: 'Adidas', count: 10 },
    { name: 'Sony', count: 5 },
    { name: 'LG', count: 7 },
  ];

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search
      if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      // Price
      if (product.discountedPrice) {
        if (product.discountedPrice < filters.priceRange[0] || product.discountedPrice > filters.priceRange[1]) return false;
      } else {
        if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      }
      return true;
    });
  }, [searchQuery, filters]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
    }
    return sorted;
  }, [filteredProducts, sortOption]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: MarketplaceFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const renderBanner = (banner: SidebarBanner, index: number) => {
    const bannerLink = banner.link || '#';

    // Check type or generic style
    const isFlash = banner.type === 'flash_sale';
    const isPromo = banner.type === 'sell_promo';

    if (isFlash) {
      return (
        <div key={banner.id || index} className="flex-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
                <p className="text-orange-100 mb-4">{banner.subTitle || banner.description}</p>
                <Link href={bannerLink} className="text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-orange-100">
                  {banner.buttonText || 'View All Deals'}
                </Link>
            </div>
            {/* Optional background image for flash sale banners if provided */}
            {banner.imageUrl && (
                 <Image src={banner.imageUrl} alt="" fill className="object-cover opacity-20 -z-0" />
            )}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
      );
    }

    if (isPromo) {
      return (
        <div key={banner.id || index} className="flex-1 bg-gray-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden">
             {banner.imageUrl && (
                 <Image src={banner.imageUrl} alt="" fill className="object-cover opacity-30 -z-0" />
            )}
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{banner.subTitle || banner.description}</p>
                 <Button variant="outline" className="border-gray-700 text-white hover:bg-white hover:text-black" asChild>
                    <Link href={bannerLink}>{banner.buttonText || 'Start Selling'}</Link>
                 </Button>
            </div>
        </div>
      );
    }

    // Specific Sidebar Banner type
    if (banner.type === 'sidebar_banner') {
        return (
            <div key={banner.id || index} className="flex-1 rounded-2xl shadow-lg relative overflow-hidden aspect-[4/3] group">
                <Link href={bannerLink} className="block w-full h-full relative">
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
                    {/* Optional overlay for text if provided, otherwise the image stands alone */}
                    {(banner.title || banner.buttonText) && (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex flex-col justify-end p-6">
                            {banner.title && <h3 className="text-white text-xl font-bold mb-1">{banner.title}</h3>}
                            {banner.subTitle && <p className="text-white/90 text-sm mb-3">{banner.subTitle}</p>}
                            {banner.buttonText && (
                                <span className="inline-block bg-white text-black px-4 py-2 rounded-full text-sm font-semibold w-fit">
                                    {banner.buttonText}
                                </span>
                            )}
                        </div>
                    )}
                </Link>
            </div>
        );
    }

    // Generic fallback
    return (
      <div key={banner.id || index} className="flex-1 bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden border border-gray-100">
          {banner.imageUrl && (
                 <Image src={banner.imageUrl} alt="" fill className="object-cover opacity-10" />
            )}
         <div className="relative z-10">
             <h3 className="text-xl font-bold mb-2 text-gray-900">{banner.title}</h3>
             <p className="text-gray-600 text-sm mb-4">{banner.subTitle || banner.description}</p>
             <Button className="w-full" asChild>
                <Link href={bannerLink}>{banner.buttonText || 'Explore'}</Link>
             </Button>
         </div>
      </div>
    );
  };

  // Unified section handling: Convert to array if it's an object, or use as-is if array
  const sectionsArray = Array.isArray(sections)
    ? sections
    : sections
      ? Object.values(sections)
      : [];

  // Find specific sections by type
  const flashSaleConfig = sectionsArray.find(s => s.type === 'flash_sale');
  const promoCarouselConfigs = sectionsArray.filter(s => s.type === 'promo_carousel');

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-4">
        
        {/* 1. Hero Section (Treasure Hunt & Promotions) */}
        {isPublicDataLoading ? (
             <div className="h-[400px] w-full flex items-center justify-center bg-white rounded-2xl shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        ) : (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Slider */}
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
                            {heroSlides[activeSlide].link && (
                                <Button className="mt-4 w-fit bg-white text-black hover:bg-gray-100" asChild>
                                    <Link href={heroSlides[activeSlide].link!}>
                                        {heroSlides[activeSlide].buttonText || 'Shop Now'}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                {heroSlides.map((_, index) => (
                    <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                        activeSlide === index ? 'bg-white w-6' : 'bg-white/50'
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

          {/* Right Side Promo Cards */}
          <div className="flex flex-col gap-6">
             {/* If Flash Sale Section is Active, show it prominently here or in the banners list */}
             {flashSaleConfig?.isVisible && (
                <div className="flex-1 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-1">{flashSaleConfig.title || 'Flash Sale'}</h3>
                        {flashSaleConfig.config.endTime && (
                             <p className="text-red-100 mb-4 font-mono">
                                Ends: {new Date(flashSaleConfig.config.endTime).toLocaleDateString()}
                             </p>
                        )}
                         <Link href="/flash-sales" className="text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-red-100">
                           Shop Deals
                         </Link>
                    </div>
                </div>
             )}

             {sidebarBanners.map((banner, idx) => renderBanner(banner, idx))}

             {sidebarBanners.length === 0 && !flashSaleConfig?.isVisible && (
                 <div className="flex-1 bg-gray-100 rounded-2xl p-6 flex items-center justify-center text-gray-400">
                     No promotions
                 </div>
             )}
          </div>
        </div>
        )}

        {/* 1.5 Promo Carousel Section(s) */}
        {promoCarouselConfigs.map((config, idx) => (
            <PromoCarousel key={config.id || idx} section={config} products={allProducts} />
        ))}

        {/* 2. Main Layout Split */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
             <div className="sticky top-28">
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
                      placeholder="Search products, brands, categories..." 
                      className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   {/* Sort Dropdown */}
                   <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">New Arrivals</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggles */}
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
                <p>Showing <span className="font-semibold text-gray-900">{currentProducts.length}</span> of <span className="font-semibold text-gray-900">{sortedProducts.length}</span> results</p>
                {/* Mobile Filter Toggle could go here */}
                 <Button variant="ghost" className="lg:hidden text-primary">
                    Filters
                 </Button>
              </div>
            </div>

            {/* Product Grid/List */}
            {currentProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "flex flex-col gap-4"
              }>
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ categories: [], priceRange: [0, 5000], brands: [], minRating: null });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
