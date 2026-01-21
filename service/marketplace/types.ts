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
}

export interface MarketplaceSections {
  flashSale?: MarketplaceSectionConfig;
  promoCarousel?: MarketplaceSectionConfig;
  [key: string]: MarketplaceSectionConfig | undefined;
}

export interface MarketplacePublicData {
  heroSlides: HeroSlide[];
  sidebarBanners: SidebarBanner[];
  categories: MarketplaceCategory[];
  sections: MarketplaceSections;
}
