'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/service/hooks/useSearch';
import ProductCard from './components/ProductCard';
import ClientProviders from '@/components/client-provider';
import { Product, Service } from '@/service/listings/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data, isLoading, isError } = useSearch(query);

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (isError) {
    return <div className="container mx-auto p-4">Error fetching search results.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.items.map((item: Product | Service) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <ClientProviders>
      <SearchResults />
    </ClientProviders>
  );
}
