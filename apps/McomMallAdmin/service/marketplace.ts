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

// --- React Query hooks (admin curation) ---

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function marketplaceError(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const marketplaceKeys = {
    banners: ['marketplace', 'banners'] as const,
    categories: ['marketplace', 'categories'] as const,
    sections: ['marketplace', 'sections'] as const,
};

export const useGetMarketplaceBanners = () =>
    useQuery({ queryKey: marketplaceKeys.banners, queryFn: getBanners });

export const useUpdateMarketplaceBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBannerDTO }) => updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.banners });
            toast.success('Banner updated');
        },
        onError: (e: unknown) => toast.error(marketplaceError(e, 'Failed to update banner')),
    });
};

export const useDeleteMarketplaceBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.banners });
            toast.success('Banner deleted');
        },
        onError: (e: unknown) => toast.error(marketplaceError(e, 'Failed to delete banner')),
    });
};

export const useGetMarketplaceCategories = () =>
    useQuery({ queryKey: marketplaceKeys.categories, queryFn: getCategories });

export const useCreateMarketplaceCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoryDTO) => createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.categories });
            toast.success('Category created');
        },
        onError: (e: unknown) => toast.error(marketplaceError(e, 'Failed to create category')),
    });
};

export const useUpdateMarketplaceCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.categories });
            toast.success('Category updated');
        },
        onError: (e: unknown) => toast.error(marketplaceError(e, 'Failed to update category')),
    });
};

export const useDeleteMarketplaceCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.categories });
            toast.success('Category deleted');
        },
        onError: (e: unknown) => toast.error(marketplaceError(e, 'Failed to delete category')),
    });
};

export const useGetMarketplaceSections = () =>
    useQuery({ queryKey: marketplaceKeys.sections, queryFn: getSections });

export const useUpdateMarketplaceSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ type, data }: { type: string; data: UpdateSectionDTO }) => updateSection(type, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.sections });
            toast.success('Section updated');
        },
        onError: (e: unknown) => toast.error(marketplaceError(e, 'Failed to update section')),
    });
};
