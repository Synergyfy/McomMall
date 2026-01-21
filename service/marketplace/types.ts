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
}
