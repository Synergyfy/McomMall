'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { useSearch } from '@/service/search/hook';
import { Product, Service } from '@/service/search/types';
import { CURRENCY } from '@/lib/utils';
import Image from 'next/image';

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const query = searchParams.get('q') || '';
  const { data, isLoading, isError } = useSearch(query);

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

  const renderPrice = (item: Product | Service) => {
    if ('price' in item) {
      return `${CURRENCY}${item.price.toFixed(2)}`;
    }
    if ('pricePerHour' in item && item.pricePerHour) {
      return `${CURRENCY}${item.pricePerHour.toFixed(2)}/hr`;
    }
    if ('fixedPrice' in item && item.fixedPrice) {
      return `${CURRENCY}${item.fixedPrice.toFixed(2)}`;
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
        <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>Error fetching results.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.items?.map((item: Product | Service) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const SearchPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SearchResultsPage />
  </Suspense>
);

export default SearchPage;
