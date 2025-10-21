'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { useSearch } from '@/service/search/hook';
import { Product, Service } from '@/service/search/types';
import { CURRENCY } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { PricingModel } from '@/service/search/enums';
import { BookingModal } from '@/components/BookingModal';

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const query = searchParams.get('q') || '';
  const { data, isLoading, isError } = useSearch(query);
  const { addItemToCart } = useCart();

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

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg p-2">
                <Search className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent focus:outline-none text-black"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg p-2">
                <MapPin className="text-gray-400 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-transparent focus:outline-none text-black"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search Results for &quot;{query}&quot;</h1>
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p>Error fetching results.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.items?.map((item: Product | Service) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={getImageUrl(item)}
                      alt={'title' in item ? item.title : item.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="font-bold text-lg mb-2 truncate">{'title' in item ? item.title : item.name}</h2>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">{'shortDescription' in item ? item.shortDescription : item.description}</p>
                    {item.business && <p className="text-sm text-gray-500 mb-2">Sold by: {item.business.businessName}</p>}
                    <div className="text-lg font-bold text-orange-600">{renderPrice(item)}</div>
                    {'productType' in item ? (
                      <div className="flex flex-col gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-orange-600 text-orange-600 bg-transparent hover:bg-orange-600 hover:text-white transition-all duration-300 font-bold"
                          onClick={(e) => handleAddToCart(e, item as Product)}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                          onClick={(e) => handleBuyNow(e, item as Product)}
                        >
                          Buy Now
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-4">
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 font-bold shadow-md hover:shadow-lg"
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
  <Suspense fallback={<div>Loading...</div>}>
    <SearchResultsPage />
  </Suspense>
);

export default SearchPage;
