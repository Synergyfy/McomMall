import { baseURL } from '@/service/api';
import MarketplaceClient from './MarketplaceClient';
import { MarketplacePublicData } from '@/service/marketplace/types';
import { Product } from '@/service/listings/types';
import { PageDto } from '@/service/marketplace/types';

export const revalidate = 3600; // Revalidate every hour

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function getMarketplacePublic() {
  try {
    const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const res = await fetchWithTimeout(`${cleanBaseURL}/marketplace/public`, {
      next: { revalidate: 3600 }
    }, 8000);
    if (!res.ok) {
      console.error('Failed to fetch marketplace public data:', res.statusText);
      return undefined;
    }
    return await res.json() as MarketplacePublicData;
  } catch (error) {
    console.error('Error fetching marketplace public data:', error);
    return undefined;
  }
}

async function getNewProducts() {
  try {
    const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const res = await fetchWithTimeout(`${cleanBaseURL}/product/public?page=1&limit=4`, {
        next: { revalidate: 3600 }
    }, 8000);
    if (!res.ok) {
        console.error('Failed to fetch new products:', res.statusText);
        return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 4, totalPages: 0, currentPage: 1, hasNextPage: false, hasPreviousPage: false } } as PageDto<Product>;
    }
    return await res.json() as Promise<PageDto<Product>>;
  } catch (error) {
    console.error('Error fetching new products:', error);
    return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 4, totalPages: 0, currentPage: 1, hasNextPage: false, hasPreviousPage: false } } as PageDto<Product>;
  }
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

