export interface AdminRole {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
    memberCount?: number;
    created_at?: string;
    updated_at?: string;
}

export interface RoleMember {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
}

export interface CreateAdminRoleDto {
    name: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
}

export interface UpdateAdminRoleDto {
    name?: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
}

export const AVAILABLE_PERMISSIONS = [
    'users.view',
    'users.edit',
    'listings.manage',
    'listings.review',
    'marketing.manage',
    'verifications.manage',
    'messages.view',
    'billing.view',
    'settings.manage',
    'all',
];
