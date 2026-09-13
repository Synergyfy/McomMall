'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Star, Store, ChevronRight, ShoppingBag } from 'lucide-react';
import { useSearch } from '@/service/search/hook';
import { useGetInHouseBusiness, useGetGoogleListings } from '@/service/listings/hook';
import { Product, Service } from '@/service/search/types';
import { CURRENCY } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { PricingModel } from '@/service/search/enums';
import { BookingModal } from '@/components/BookingModal';
import { baseURL } from '@/service/api';
import EmptyState from './EmptyState';

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Tab State: 'shops' (Local Storefronts) vs 'products' (Products & Services)
  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');

  // Geolocation coordinates (Default fallback: London Camden)
  const [lat, setLat] = useState(51.539);
  const [lng, setLng] = useState(-0.142);

  const query = searchParams.get('q') || '';
  const { addItemToCart } = useCart();

  // Parallel Query 1: In-House Database Storefronts (Claimed)
  const { 
    data: inHouseResults, 
    isLoading: inHouseLoading, 
    isError: inHouseError 
  } = useGetInHouseBusiness({ queryText: query || null });

  // Parallel Query 2: Google Place Listings (Unclaimed)
  const { 
    data: googleResults, 
    isLoading: googleLoading, 
    isError: googleError 
  } = useGetGoogleListings({ lat, lng, queryText: query || null });

  // Query 3: Products and Services (Original Search Engine)
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    isError: productsError 
  } = useSearch(query);

  // Fetch coordinates on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (error) => {
          console.log('Using default Camden location coordinates:', error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItemToCart({ productId: product.id, quantity: 1 });
    toast.success(`${product.title} has been added to your cart.`);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItemToCart({ productId: product.id, quantity: 1 });
    router.push('/cart');
  };

  const handleBookNow = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    setSelectedService(service);
  };

  const handleCardClick = (item: Product | Service) => {
    if ('productType' in item) {
      router.push(`/products/${item.id}`);
    } else {
      router.push(`/services/${item.id}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const renderPrice = (item: Product | Service) => {
    if ('price' in item && typeof item.price === 'number') {
      return `${CURRENCY}${item.price.toFixed(2)}`;
    }
    if ('pricingModel' in item) {
      switch (item.pricingModel) {
        case PricingModel.FIXED:
          if (item.fixedPrice) {
            return `${CURRENCY}${parseFloat(item.fixedPrice).toFixed(2)}`;
          }
          break;
        case PricingModel.PER_HOUR:
          if (item.pricePerHour) {
            return `${CURRENCY}${parseFloat(item.pricePerHour).toFixed(2)}/hr`;
          }
          break;
        case PricingModel.PER_UNIT:
          if (item.pricePerUnit) {
            return `${CURRENCY}${parseFloat(item.pricePerUnit).toFixed(2)}/${item.unitName || 'unit'}`;
          }
          break;
        default:
          return 'Price not available';
      }
    }
    return 'Price not available';
  };

  const getImageUrl = (item: Product | Service) => {
    if ('fileUrls' in item && item.fileUrls && item.fileUrls.length > 0) {
      return item.fileUrls[0];
    }
    if (item.media && item.media.length > 0) {
      return item.media[0];
    }
    return '/placeholder.png';
  };

  const extractPostcode = (address: string) => {
    const match = address.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i);
    return match ? match[0] : '';
  };

  // --- De-duplication Logic ---
  // Any Google place result that matches the googlePlaceId of a claimed in-house business is excluded from the unclaimed list.
  const claimedPlaceIds = new Set(
    inHouseResults?.map((item: any) => item.googlePlaceId).filter(Boolean) || []
  );
  
  const unclaimedGoogleShops = googleResults?.filter(
    (item: any) => !claimedPlaceIds.has(item.placeId || item.place_id)
  ) || [];

  return (
    <>
      <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] font-sans pb-16">
        
        {/* Search Header panel */}
        <header className="bg-white shadow-sm border-b border-[#e2bfb0]/20 sticky top-0 z-45">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              
              <div className="flex-1 w-full flex items-center border border-[#e2bfb0]/40 rounded-xl px-4 py-3 bg-[#f8f9ff]">
                <Search className="text-gray-400 mr-2 shrink-0" size={18} />
                <input
                  type="text"
                  placeholder="Search local shops, products, or services..."
                  className="w-full bg-transparent focus:outline-none text-sm font-medium text-slate-800"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="w-full md:w-64 flex items-center border border-[#e2bfb0]/40 rounded-xl px-4 py-3 bg-[#f8f9ff]">
                <MapPin className="text-gray-400 mr-2 shrink-0" size={18} />
                <input
                  type="text"
                  placeholder="Borough or Postcode"
                  className="w-full bg-transparent focus:outline-none text-sm font-medium text-slate-800"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <button
                className="w-full md:w-auto bg-[#ff6900] hover:bg-[#a14000] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            {/* Selector tabs styling matching onboarding tones */}
            <div className="flex gap-4 mt-6 border-b border-gray-150">
              <button
                onClick={() => setActiveTab('shops')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'shops'
                    ? 'border-[#ff6900] text-[#a14000]'
                    : 'border-transparent text-gray-400 hover:text-[#5a4136]'
                }`}
              >
                Local Shops
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'products'
                    ? 'border-[#ff6900] text-[#a14000]'
                    : 'border-transparent text-gray-400 hover:text-[#5a4136]'
                }`}
              >
                Products & Services
              </button>
            </div>

          </div>
        </header>

        {/* Search Results Display Area */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-baseline mb-6 flex-wrap gap-2">
            <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">
              Search Results for &quot;{query}&quot;
            </h1>
            <span className="text-xs text-gray-400 font-bold uppercase">
              {activeTab === 'shops' ? 'Unified Directory' : 'Local Catalog'}
            </span>
          </div>

          {/* ---------------- LOCAL SHOPS TAB (Unified claimed & unclaimed results) ---------------- */}
          {activeTab === 'shops' && (
            <div>
              {inHouseLoading || googleLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#5a4136] font-bold uppercase tracking-wider">Searching local district...</p>
                </div>
              ) : inHouseError || googleError ? (
                <div className="text-center py-16 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6">
                  <p className="text-red-500 font-bold">Failed to resolve directory search.</p>
                  <p className="text-xs text-gray-400 mt-1">Please check internet connection or refine search arguments.</p>
                </div>
              ) : (inHouseResults && inHouseResults.length > 0) || unclaimedGoogleShops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Render database active storefronts (Claimed) */}
                  {inHouseResults?.map((item: any) => {
                    const typeLabel = item.listingType?.[0] || 'Business';
                    return (
                      <div 
                        key={item.id}
                        onClick={() => router.push(`/business/${item.id}`)}
                        className="group bg-white border border-[#e2bfb0]/20 hover:border-[#ff6900]/40 rounded-3xl p-4 flex gap-4 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer shadow-xs"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                          {item.logoUrl ? (
                            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.logoUrl} alt={item.businessName} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#ff6900]/40">
                              <Store className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-extrabold text-[#0b1c30] group-hover:text-[#ff6900] transition-colors truncate text-base">{item.businessName}</h3>
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-emerald-200 shrink-0">Active</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#5a4136] mt-1 text-xs font-semibold">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current shrink-0" />
                              <span>{item.averageRating ? item.averageRating.toFixed(1) : '5.0'}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400 capitalize">{typeLabel.toLowerCase()}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">{item.location?.addressLine1 || item.location?.city}</p>
                          </div>
                          <span className="text-[#ff6900] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start mt-2">
                            Explore storefront <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Render Google Places listings (Unclaimed) */}
                  {unclaimedGoogleShops.map((result: any) => {
                    const placeId = result.place_id || result.placeId;
                    const photoRef = result.photos?.[0]?.photo_reference || result.photos?.[0]?.photoReference;
                    const typeLabel = result.types?.[0]
                      ? result.types[0].replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                      : 'Shop';

                    return (
                      <div 
                        key={placeId}
                        onClick={() => router.push(`/storefront/${placeId}/signal`)}
                        className="group bg-white border border-[#e2bfb0]/20 hover:border-[#ff6900]/40 rounded-3xl p-4 flex gap-4 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer shadow-xs"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                          {photoRef ? (
                            <img 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              src={`${baseURL}google/google-business/photo/${photoRef}`} 
                              alt={result.name} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Store className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-extrabold text-[#0b1c30] group-hover:text-[#ff6900] transition-colors truncate text-base">{result.name}</h3>
                              <span className="bg-blue-50 text-blue-600 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-200 shrink-0">Unclaimed</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#5a4136] mt-1 text-xs font-semibold">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current shrink-0" />
                              <span>{result.rating || '0.0'}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400">{typeLabel}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">{result.formatted_address || result.vicinity}</p>
                          </div>
                          <button 
                            className="mt-2 text-white bg-[#a14000] hover:bg-[#ff6900] text-[10px] font-black uppercase px-4 py-2 rounded-lg self-start transition-colors shadow-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/storefront/${placeId}/signal`);
                            }}
                          >
                            Vote / Claim Store
                          </button>
                        </div>
                      </div>
                    );
                  })}

                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          )}

          {/* ---------------- PRODUCTS & SERVICES TAB (Original catalog results) ---------------- */}
          {activeTab === 'products' && (
            <div>
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[#5a4136] font-bold uppercase tracking-wider">Searching product catalog...</p>
                </div>
              ) : productsError ? (
                <div className="text-center py-16 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6">
                  <p className="text-red-500 font-bold">Failed to fetch catalog results.</p>
                </div>
              ) : productsData?.items && productsData.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {productsData.items.map((item: Product | Service) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-sm border border-[#e2bfb0]/15 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all group"
                      onClick={() => handleCardClick(item)}
                    >
                      <div className="relative h-48 w-full bg-gray-50 border-b border-gray-50">
                        <img
                          src={getImageUrl(item)}
                          alt={'title' in item ? item.title : item.name}
                          className="absolute inset-0 h-full w-full group-hover:scale-103 transition-transform duration-300 object-cover"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h2 className="font-extrabold text-[#0b1c30] text-base mb-1 truncate">{'title' in item ? item.title : item.name}</h2>
                        <p className="text-gray-400 text-xs mb-3 flex-grow line-clamp-2">{'shortDescription' in item ? item.shortDescription : item.description}</p>
                        {item.business && <p className="text-xs font-semibold text-[#5a4136] mb-2 flex items-center gap-1"><Store className="w-3.5 h-3.5 text-[#ff6900]" /> {item.business.businessName}</p>}
                        <div className="text-base font-black text-[#ff6900]">{renderPrice(item)}</div>
                        
                        {'productType' in item ? (
                          <div className="flex flex-col gap-2 mt-4">
                            <Button
                              variant="outline"
                              className="w-full border-2 border-[#ff6900] text-[#ff6900] hover:bg-[#ff6900] hover:text-white transition-all duration-300 font-bold rounded-xl text-xs py-5"
                              onClick={(e) => handleAddToCart(e, item as Product)}
                            >
                              Add to Cart
                            </Button>
                            <Button
                              className="w-full bg-[#ff6900] hover:bg-[#a14000] text-white transition-all duration-300 font-bold shadow-xs rounded-xl text-xs py-5"
                              onClick={(e) => handleBuyNow(e, item as Product)}
                            >
                              Buy Now
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 mt-4">
                            <Button
                              className="w-full bg-[#ff6900] hover:bg-[#a14000] text-white transition-all duration-300 font-bold shadow-xs rounded-xl text-xs py-5"
                              onClick={(e) => handleBookNow(e, item as Service)}
                            >
                              Book Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          )}

        </main>
      </div>

      <BookingModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseModal}
      />
    </>
  );
};

const SearchPage = () => (
  <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center font-bold text-xs uppercase text-[#5a4136] tracking-widest">Loading search...</div>}>
    <SearchResultsPage />
  </Suspense>
);

export default SearchPage;
