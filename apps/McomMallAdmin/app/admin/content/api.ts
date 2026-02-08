import api from '@/service/api';
import { Sector, Category, Subcategory } from '@/app/admin/types';

// The base URL is already handled by the axios instance in '@/service/api'

const TAXONOMY_ENDPOINTS = {
    SECTORS: `/taxonomy/sectors`,
    CATEGORIES: `/taxonomy/categories`,
    SUBCATEGORIES: `/taxonomy/subcategories`, // For Create/Update/Delete by ID if applicable
};

// --- Sectors ---
export async function fetchSectors(): Promise<Sector[]> {
    const res = await api.get<Sector[]>(TAXONOMY_ENDPOINTS.SECTORS);
    return res.data;
}

export async function createSector(data: { name: string; image?: string; description?: string }) {
    const res = await api.post(TAXONOMY_ENDPOINTS.SECTORS, data);
    return res.data;
}

export async function updateSector(id: string, data: { name: string; image?: string; description?: string }) {
    const res = await api.patch(`${TAXONOMY_ENDPOINTS.SECTORS}/${id}`, data);
    return res.data;
}

export async function deleteSector(id: string) {
    const res = await api.delete(`${TAXONOMY_ENDPOINTS.SECTORS}/${id}`);
    return res.data;
}

// --- Categories ---
export async function fetchCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>(TAXONOMY_ENDPOINTS.CATEGORIES);
    return res.data;
}

export async function createCategory(data: { name: string; sectorId: string; image?: string; description?: string }) {
    const res = await api.post(TAXONOMY_ENDPOINTS.CATEGORIES, data);
    return res.data;
}

export async function updateCategory(id: string, data: { name: string; sectorId: string; image?: string; description?: string }) {
    const res = await api.patch(`${TAXONOMY_ENDPOINTS.CATEGORIES}/${id}`, data);
    return res.data;
}

export async function deleteCategory(id: string) {
    const res = await api.delete(`${TAXONOMY_ENDPOINTS.CATEGORIES}/${id}`);
    return res.data;
}

// --- Subcategories ---
export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
    // Correct Endpoint: /taxonomy/categories/{categoryId}/subcategories
    const res = await api.get<Subcategory[]>(`/taxonomy/categories/${categoryId}/subcategories`);
    return res.data;
}

export async function createSubcategory(data: { name: string; categoryId: string; image?: string; description?: string }) {
    // Assuming create is still on the main resource or nested?
    // Based on standard REST, it's often POST /taxonomy/subcategories with categoryId in body
    // OR POST /taxonomy/categories/{id}/subcategories
    // The prompt earlier said: "Create a new subcategory... schema { categoryId: ... }"
    // This implies the body contains the ID, so likely POST /taxonomy/subcategories.
    // If that fails, we can try the nested one. sticking to the flat one for now as it matches the schema description.
    const res = await api.post(TAXONOMY_ENDPOINTS.SUBCATEGORIES, data);
    return res.data;
}

export async function updateSubcategory(id: string, data: { name: string; categoryId: string; image?: string; description?: string }) {
    const res = await api.patch(`${TAXONOMY_ENDPOINTS.SUBCATEGORIES}/${id}`, data);
    return res.data;
}

export async function deleteSubcategory(id: string) {
    const res = await api.delete(`${TAXONOMY_ENDPOINTS.SUBCATEGORIES}/${id}`);
    return res.data;
}
