export type TeamRole = 'manager' | 'staff' | 'agent';
export type TeamMemberStatus = 'active' | 'suspended';

export interface TeamPermissions {
    storefront: boolean;
    analytics: boolean;
    orders: boolean;
    customers: boolean;
    marketing: boolean;
    inventory: boolean;
}

export interface TeamMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: TeamRole;
    status: TeamMemberStatus;
    permissions: TeamPermissions;
    created_at?: string;
}

export interface TeamInvite {
    id: string;
    email: string;
    role: TeamRole;
    status: string;
    permissions: TeamPermissions;
    expiresAt?: string;
    created_at?: string;
}

export interface BusinessTeam {
    members: TeamMember[];
    invites: TeamInvite[];
}

export interface InviteMemberDto {
    email: string;
    role: TeamRole;
    permissions: TeamPermissions;
}

export interface UpdateMemberDto {
    role?: TeamRole;
    status?: TeamMemberStatus;
    permissions?: TeamPermissions;
}

export const DEFAULT_PERMISSIONS: TeamPermissions = {
    storefront: true,
    analytics: false,
    orders: true,
    customers: false,
    marketing: false,
    inventory: false,
};
