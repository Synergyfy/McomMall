import { baseURL } from '@/service/api';
import MarketplaceClient from './MarketplaceClient';
import { MarketplacePublicData } from '@/service/marketplace/types';
import { Product } from '@/service/listings/types';
import { PageDto } from '@/service/marketplace/types';

export const revalidate = 3600; // Revalidate every hour

async function getMarketplacePublic() {
  const res = await fetch(`${baseURL}/marketplace/public`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch marketplace data');
  }
  return res.json() as Promise<MarketplacePublicData>;
}

async function getNewProducts() {
    // Manually constructing the query string as we can't use axios params here easily or it's just simpler
    // Default params: page=1, limit=4
    const res = await fetch(`${baseURL}/product/public?page=1&limit=4`, {
        next: { revalidate: 3600 }
    });
    if (!res.ok) {
        // Fallback for new products if it fails? or throw?
        // Let's return null or empty to avoid crashing the whole page if just products fail
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
