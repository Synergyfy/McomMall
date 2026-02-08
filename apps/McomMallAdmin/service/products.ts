import api from '@/service/api';

export interface Product {
    id: string;
    name: string;
    businessName: string;
    businessId: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    description: string;
    images: string[];
    createdAt: string;
}

export interface GetProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetProductsParams {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
}

const ENDPOINT = '/admin/products';

export const getProducts = async (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
    const response = await api.get<GetProductsResponse>(ENDPOINT, { params });
    return response.data;
};
