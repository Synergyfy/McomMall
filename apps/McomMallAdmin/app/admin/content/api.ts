import api from '@/service/api';
import { Sector, Category, Subcategory } from '@/app/admin/types';

// The base URL is already handled by the axios instance in '@/service/api'

const TAXONOMY_ENDPOINTS = {
    SECTORS: `/taxonomy/sectors`,
    CATEGORIES: `/taxonomy/categories`,
};

// Taxonomy is authored in MCOM Central Hub and mirrored locally. Legacy Mall
// rows with no centralId are hidden so collectors only offer Central options.
const centralOnly = <T extends { centralId?: string | null }>(rows: T[]): T[] =>
    rows.filter((row) => !!row.centralId);

// --- Sectors ---
export async function fetchSectors(): Promise<Sector[]> {
    const res = await api.get<Sector[]>(TAXONOMY_ENDPOINTS.SECTORS);
    return centralOnly(res.data);
}

// --- Categories ---
export async function fetchCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>(TAXONOMY_ENDPOINTS.CATEGORIES);
    return centralOnly(res.data);
}

// --- Subcategories ---
export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
    const res = await api.get<Subcategory[]>(`/taxonomy/categories/${categoryId}/subcategories`);
    return centralOnly(res.data);
}
