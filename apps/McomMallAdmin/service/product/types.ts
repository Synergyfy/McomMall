export interface AdminProduct {
    id: string;
    name: string;
    businessName: string;
    businessId: string;
    category: string;
    price: number;
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock' | 'pending' | 'rejected' | 'delisted';
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    adminDisabled?: boolean;
    reviewNote?: string | null;
    reviewedAt?: string | null;
    description: string;
    images: string[];
    createdAt: string;
}

export interface AdminProductStats {
    total: number;
    active: number;
    outOfStock: number;
}

export interface AdminProductResponse {
    data: AdminProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminProductFilters {
    search?: string;
    phone?: string;
    status?: string | 'active';
    category?: string;
    page?: number;
    limit?: number;
}
