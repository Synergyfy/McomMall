import api from '@/service/api';
import { AdminRole, RoleMember, CreateAdminRoleDto, UpdateAdminRoleDto } from './types';

const ENDPOINT = '/admin/roles';

export async function getAdminRoles(): Promise<AdminRole[]> {
    const { data } = await api.get<AdminRole[]>(ENDPOINT);
    return data;
}

export async function getRoleMembers(id: string): Promise<RoleMember[]> {
    const { data } = await api.get<RoleMember[]>(`${ENDPOINT}/${id}/members`);
    return data;
}

export async function createAdminRole(dto: CreateAdminRoleDto): Promise<AdminRole> {
    const { data } = await api.post<AdminRole>(ENDPOINT, dto);
    return data;
}

export async function updateAdminRole(id: string, dto: UpdateAdminRoleDto): Promise<AdminRole> {
    const { data } = await api.patch<AdminRole>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function assignRoleMember(roleId: string, userId: string): Promise<unknown> {
    const { data } = await api.post(`${ENDPOINT}/${roleId}/assign`, { userId });
    return data;
}

export async function unassignRoleMember(userId: string): Promise<unknown> {
    const { data } = await api.delete(`${ENDPOINT}/members/${userId}`);
    return data;
}

export async function deleteAdminRole(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
