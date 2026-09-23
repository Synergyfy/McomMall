import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getAdminRoles,
    getRoleMembers,
    createAdminRole,
    updateAdminRole,
    assignRoleMember,
    unassignRoleMember,
    deleteAdminRole,
} from './api';
import { CreateAdminRoleDto, UpdateAdminRoleDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export const roleKeys = {
    all: ['admin-roles'] as const,
    members: (id: string) => ['admin-roles', 'members', id] as const,
};

export function useGetAdminRoles() {
    return useQuery({ queryKey: roleKeys.all, queryFn: getAdminRoles });
}

export function useGetRoleMembers(roleId: string | undefined) {
    return useQuery({
        queryKey: roleId ? roleKeys.members(roleId) : ['admin-roles', 'members', 'none'],
        queryFn: () => getRoleMembers(roleId as string),
        enabled: !!roleId,
    });
}

export function useCreateAdminRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateAdminRoleDto) => createAdminRole(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            toast.success('Role created');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to create role')),
    });
}

export function useUpdateAdminRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateAdminRoleDto }) => updateAdminRole(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            toast.success('Role updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update role')),
    });
}

export function useAssignRoleMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
            assignRoleMember(roleId, userId),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            queryClient.invalidateQueries({ queryKey: roleKeys.members(vars.roleId) });
            toast.success('Member assigned');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to assign member')),
    });
}

export function useUnassignRoleMember(roleId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => unassignRoleMember(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            if (roleId) queryClient.invalidateQueries({ queryKey: roleKeys.members(roleId) });
            toast.success('Member unassigned');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to unassign member')),
    });
}

export function useDeleteAdminRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteAdminRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            toast.success('Role deleted');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to delete role')),
    });
}
