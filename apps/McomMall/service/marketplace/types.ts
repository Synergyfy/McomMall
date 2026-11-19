import { VoucherProduct } from '../vouchers/types';
import { GiftCardTemplate } from '../gift-cards/types';
import { CouponProduct } from '../coupon-products/types';
import { Service } from '../services/types';
import { Product } from '../listings/types';

export interface PageMetaDto {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PageDto<T> {
  data: T[];
  meta: PageMetaDto;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
  subTitle?: string;
  buttonText?: string;
  displayOrder: number;
}

export interface SidebarBanner {
  id: string;
  imageUrl?: string;
  title?: string;
  subTitle?: string;
  description?: string;
  buttonText?: string;
  link: string;
  displayOrder: number;
  type?: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  iconName: string;
  targetCategoryId: string;
}

// Minimal Product interface for the embedded product data
export interface EmbeddedProduct {
  id: string | number;
  title: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  media?: string[];
  stock?: number;
  category?: string;
  [key: string]: any;
}

export interface MarketplaceSectionConfig {
  id?: string;
  title: string;
  isVisible: boolean;
  type: string;
  config: {
    endTime?: string;
    backgroundColor?: string;
    [key: string]: any;
  };
  productIds?: string[];
  products?: EmbeddedProduct[];
  // Snake case fallbacks
  is_visible?: boolean;
  product_ids?: string[];
}

export interface MarketplaceSections {
  flashSale?: MarketplaceSectionConfig;
  promoCarousel?: MarketplaceSectionConfig;
  // Snake case fallbacks
  flash_sale?: MarketplaceSectionConfig;
  promo_carousel?: MarketplaceSectionConfig;
  [key: string]: MarketplaceSectionConfig | undefined;
}

export type MarketplaceLocationLevel =
  | 'city'
  | 'borough'
  | 'high-street'
  | 'local-mall'
  | 'area'
  | 'postcode';

export interface MarketplaceLocationFacet {
  id: string;
  name: string;
  count: number;
  latitude: number | null;
  longitude: number | null;
  children: MarketplaceLocationFacet[];
}

export interface MarketplaceLocationFacets {
  cities: MarketplaceLocationFacet[];
  /** Legacy `locations.city` / `resolvedArea` fallback, available pre-backfill. */
  areas: MarketplaceLocationFacet[];
  totalBusinesses: number;
  updatedAt: string;
}

export interface MarketplaceLocationSearchResult {
  level: MarketplaceLocationLevel;
  id: string;
  name: string;
  count: number;
  path: string[];
}

export interface MarketplaceLocationSearchResponse {
  results: MarketplaceLocationSearchResult[];
}

export interface ResolvedMarketplaceLocation {
  scope: {
    type: MarketplaceLocationLevel;
    id: string;
    name: string;
  } | null;
  hierarchy: {
    city: { id: string; name: string } | null;
    borough: { id: string; name: string } | null;
    highStreet: { id: string; name: string } | null;
    localMall: { id: string; name: string } | null;
  };
  source: 'profile' | 'postcode' | 'geolocation' | 'nearest' | 'none';
  country: string | null;
}

export interface MarketplacePublicData {
  heroSlides: HeroSlide[];
  sidebarBanners: SidebarBanner[];
  categories: MarketplaceCategory[];
  sections: MarketplaceSections;
  vouchers: VoucherProduct[];
  giftCards: GiftCardTemplate[];
  coupons: CouponProduct[];
  services: Service[];
  products: Product[];
}
