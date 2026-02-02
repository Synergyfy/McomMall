import { VoucherProduct } from '../vouchers/types';
import { GiftCardTemplate } from '../gift-cards/types';
import { CouponProduct } from '../coupons/types';
import { Service } from '../services/types';

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

export interface MarketplacePublicData {
  heroSlides: HeroSlide[];
  sidebarBanners: SidebarBanner[];
  categories: MarketplaceCategory[];
  sections: MarketplaceSections;
  vouchers: VoucherProduct[];
  giftCards: GiftCardTemplate[];
  coupons: CouponProduct[];
  services: Service[];
}
