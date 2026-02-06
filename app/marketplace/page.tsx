import { baseURL } from '@/service/api';
import MarketplaceClient from './MarketplaceClient';
import { MarketplacePublicData } from '@/service/marketplace/types';
import { Product } from '@/service/listings/types';
import { PageDto } from '@/service/marketplace/types';

export const revalidate = 3600; // Revalidate every hour

async function getMarketplacePublic() {
  const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const res = await fetch(`${cleanBaseURL}/marketplace/public`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch marketplace data');
  }
  return res.json() as Promise<MarketplacePublicData>;
}

async function getNewProducts() {
    const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const res = await fetch(`${cleanBaseURL}/product/public?page=1&limit=4`, {
        next: { revalidate: 3600 }
    });
    if (!res.ok) {
        console.error('Failed to fetch new products');
        return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 4, totalPages: 0, currentPage: 1, hasNextPage: false, hasPreviousPage: false } } as PageDto<Product>;
    }
    return res.json() as Promise<PageDto<Product>>;
}

export default async function MarketplacePage() {
  // Fetch data in parallel
  const [publicData, newProducts] = await Promise.allSettled([
    getMarketplacePublic(),
    getNewProducts()
  ]);

  const initialPublicData = publicData.status === 'fulfilled' ? publicData.value : undefined;
  const initialNewProducts = newProducts.status === 'fulfilled' ? newProducts.value : undefined;

  return (
    <MarketplaceClient
        initialPublicData={initialPublicData}
        initialNewProducts={initialNewProducts}
    />
  );
}
