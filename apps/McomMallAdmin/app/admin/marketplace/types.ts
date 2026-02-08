export interface MarketplaceBanner {
    id: string;
    imageUrl: string;
    title: string;
    link: string; // Changed from linkUrl
    type: 'hero_slide' | 'sidebar_banner'; // Changed sidebar to sidebar_banner per story
    displayOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface MarketplaceCategory {
    id: string;
    name: string;
    targetCategoryId: string; // Changed from sectorId
    iconName: string; // Changed from image
    isVisible: boolean; // Added per story
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
    // Optional: Include target category name if the backend returns it
    targetCategoryName?: string;
}

export interface MarketplaceSection {
    type: string; // id is likely the type in the story, but keeping type field
    title: string;
    isVisible: boolean;
    config?: Record<string, any>;
    productIds?: string[]; // Added per story
    products?: any[]; // Added to handle populated products from backend
    createdAt?: string;
    updatedAt?: string;
}

// DTOs for Creation/Updates
export interface CreateBannerDTO {
    imageUrl: string;
    title: string;
    link: string;
    type: 'hero_slide' | 'sidebar_banner';
    displayOrder: number;
    isActive: boolean;
}

export interface UpdateBannerDTO extends Partial<CreateBannerDTO> {}

export interface CreateCategoryDTO {
    name: string;
    targetCategoryId: string;
    iconName: string;
    displayOrder: number;
    isVisible: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface UpdateSectionDTO {
    title?: string;
    isVisible?: boolean;
    config?: Record<string, any>;
    productIds?: string[];
}
