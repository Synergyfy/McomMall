
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
  title: string;
  isVisible: boolean;
  config: {
    endTime?: string;
    backgroundColor?: string;
    [key: string]: any;
  };
  productIds?: string[];
}

export interface MarketplacePublicData {
  heroSlides: HeroSlide[];
  sidebarBanners: SidebarBanner[];
  categories: MarketplaceCategory[];
  sections: Record<string, MarketplaceSectionConfig>;
}
