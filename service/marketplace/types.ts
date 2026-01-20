import { Category } from '../taxonomy/types';

export interface HeroSlide {
  id: string;
  imageSrc: string;
  title: string;
  subTitle?: string;
  buttonText?: string;
  link?: string;
}

export interface SidebarBanner {
  id: string;
  title: string;
  subTitle?: string;
  description?: string;
  buttonText?: string;
  link: string;
  backgroundImage?: string;
  backgroundColor?: string;
  type?: 'flash_sale' | 'sell_promo' | 'generic';
  endTime?: string; // For flash sales
}

export interface MarketplaceSectionConfig {
  id: string;
  title: string;
  type: string;
  displayOrder: number;
  config: Record<string, any>;
}

export interface MarketplacePublicData {
  heroSlides: HeroSlide[];
  sidebarBanners: SidebarBanner[];
  categories: Category[];
  sections: Record<string, MarketplaceSectionConfig>;
}
