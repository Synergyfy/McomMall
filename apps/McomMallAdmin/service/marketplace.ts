import api from '@/service/api';
import {
    MarketplaceBanner,
    MarketplaceCategory,
    MarketplaceSection,
    CreateBannerDTO,
    UpdateBannerDTO,
    CreateCategoryDTO,
    UpdateCategoryDTO,
    UpdateSectionDTO
} from '@/app/admin/marketplace/types';

const ENDPOINTS = {
    BANNERS: '/marketplace/banners',
    CATEGORIES: '/marketplace/categories',
    SECTIONS: '/marketplace/sections',
};

// --- Banners ---

export const getBanners = async (): Promise<MarketplaceBanner[]> => {
    const response = await api.get<MarketplaceBanner[]>(ENDPOINTS.BANNERS);
    return response.data;
};

export const createBanner = async (data: CreateBannerDTO): Promise<MarketplaceBanner> => {
    const response = await api.post<MarketplaceBanner>(ENDPOINTS.BANNERS, data);
    return response.data;
};

export const updateBanner = async (id: string, data: UpdateBannerDTO): Promise<MarketplaceBanner> => {
    const response = await api.patch<MarketplaceBanner>(`${ENDPOINTS.BANNERS}/${id}`, data);
    return response.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINTS.BANNERS}/${id}`);
};

// --- Categories ---

export const getCategories = async (): Promise<MarketplaceCategory[]> => {
    const response = await api.get<MarketplaceCategory[]>(ENDPOINTS.CATEGORIES);
    return response.data;
};

export const createCategory = async (data: CreateCategoryDTO): Promise<MarketplaceCategory> => {
    const response = await api.post<MarketplaceCategory>(ENDPOINTS.CATEGORIES, data);
    return response.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryDTO): Promise<MarketplaceCategory> => {
    const response = await api.patch<MarketplaceCategory>(`${ENDPOINTS.CATEGORIES}/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
};

// --- Sections ---

export const getSections = async (): Promise<MarketplaceSection[]> => {
    const response = await api.get<MarketplaceSection[]>(ENDPOINTS.SECTIONS);
    return response.data;
};

export const updateSection = async (type: string, data: UpdateSectionDTO): Promise<MarketplaceSection> => {
    const response = await api.patch<MarketplaceSection>(`${ENDPOINTS.SECTIONS}/${type}`, data);
    return response.data;
};
