export type UserStatus = 'active' | 'suspended' | 'pending' | 'all' | 'banned';
export type UserAccountType = 'customer' | 'business' | 'admin' | 'all';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountType: 'customer' | 'business' | 'admin';
    status: 'active' | 'suspended' | 'pending';
    walletBalance: number;
    lastLogin: string;
    signupDate: string;
    verified: boolean;
    avatar: string;
    notes: string;
}

export interface AdminUserStats {
    total: number;
    active: number;
    suspended: number;
    pending: number;
}

export interface GetAdminUsersParams {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
}

export interface GetAdminUsersResponse {
    data: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminBusiness {
    id: string;
    name: string;
    owner: string;
    ownerId: string;
    status: 'published' | 'draft' | 'archived' | 'active' | 'pending' | 'suspended';
    verified: boolean;
    rating: number;
    reviewCount: number;
    listingCount: number;
    sector: string;
    category: string;
    address: string;
    email: string;
    phone: string;
    createdAt: string;
    logo: string;
    disabledNavIds?: string[];
}

export interface AdminBusinessStats {
    total: number;
    active: number;
    pending: number;
    verified: number;
}

export interface GetAdminBusinessesParams {
    search?: string;
    status?: string;
    sector?: string;
    page?: number;
    limit?: number;
}

export interface GetAdminBusinessesResponse {
    data: AdminBusiness[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BusinessListing {
    id: string;
    name: string;
    price: number;
    status: 'published' | 'draft' | 'pending';
    type: 'product' | 'service';
}

export interface UpdateBusinessDto {
    businessName?: string;
    legalName?: string;
    shortDescription?: string;
    about?: string;
    businessPhone?: string;
    businessEmail?: string;
    website?: string;
    logoUrl?: string;
    bannerUrl?: string;
    status?: string;
    listingType?: string[];
    disabledNavIds?: string[];
}

export interface BusinessDetail {
    id: string;
    businessName: string;
    legalName: string;
    shortDescription: string;
    about: string;
    businessPhone: string;
    businessEmail: string;
    website: string;
    logoUrl: string;
    bannerUrl: string;
    status: string;
    listingType: string[];
}

export interface CreateAdminUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    confirm_password?: string;
    role: string;
    provisionCode?: string;
}


export interface GetAdminTransactionsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
}

export interface AdminTransaction {
    id: string;
    reference: string;
    description: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
    business?: {
        name: string;
    };
}

export interface GetAdminTransactionsResponse {
    items: AdminTransaction[];
    meta: {
        totalItems: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}
