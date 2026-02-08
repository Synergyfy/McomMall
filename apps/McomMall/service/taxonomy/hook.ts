import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Sector, Category, SubCategory } from './types';

// Error handling interface matching other hooks
export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

// --- Sectors ---
export const useGetSectors = () => {
  return useQuery({
    queryKey: ['taxonomy', 'sectors'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Sector[]>('taxonomy/sectors');
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch sectors'
        );
      }
    },
  });
};

export const useGetSectorById = (id: string) => {
  return useQuery({
    queryKey: ['taxonomy', 'sectors', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<Sector>(`taxonomy/sectors/${id}`);
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch sector'
        );
      }
    },
    enabled: !!id,
  });
};

// --- Categories ---
export const useGetCategories = () => {
  return useQuery({
    queryKey: ['taxonomy', 'categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Category[]>('taxonomy/categories');
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch categories'
        );
      }
    },
  });
};

export const useGetAllCategories = () => {
  return useQuery({
    queryKey: ['taxonomy', 'categories', 'all'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Category[]>('taxonomy/categories/all');
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch all categories'
        );
      }
    },
  });
};

export const useGetCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['taxonomy', 'categories', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<Category>(
          `taxonomy/categories/${id}`
        );
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message || err.message || 'Failed to fetch category'
        );
      }
    },
    enabled: !!id,
  });
};

export const useGetCategoriesBySector = (sectorId: string) => {
  return useQuery({
    queryKey: ['taxonomy', 'sectors', sectorId, 'categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Category[]>(
          `taxonomy/sectors/${sectorId}/categories`
        );
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch categories for sector'
        );
      }
    },
    enabled: !!sectorId,
  });
};

// --- Subcategories ---
export const useGetSubCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['taxonomy', 'subcategories', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<SubCategory>(
          `taxonomy/subcategories/${id}`
        );
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch subcategory'
        );
      }
    },
    enabled: !!id,
  });
};

export const useGetSubCategoriesByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['taxonomy', 'categories', categoryId, 'subcategories'],
    queryFn: async () => {
      try {
        const { data } = await api.get<SubCategory[]>(
          `taxonomy/categories/${categoryId}/subcategories`
        );
        return data;
      } catch (error: unknown) {
        const err = error as ErrorResponse;
        throw new Error(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch subcategories for category'
        );
      }
    },
    enabled: !!categoryId,
  });
};
