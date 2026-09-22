import api from '@/service/api';
import { BusinessTeam, InviteMemberDto, TeamMember, UpdateMemberDto } from './types';

export async function getBusinessTeam(businessId: string): Promise<BusinessTeam> {
    const { data } = await api.get<BusinessTeam>(`/team/${businessId}`);
    return data;
}

export async function inviteTeamMember(businessId: string, dto: InviteMemberDto): Promise<unknown> {
    const { data } = await api.post(`/team/${businessId}/invite`, dto);
    return data;
}

export async function updateTeamMember(
    businessId: string,
    memberId: string,
    dto: UpdateMemberDto,
): Promise<TeamMember> {
    const { data } = await api.patch<TeamMember>(`/team/${businessId}/member/${memberId}`, dto);
    return data;
}

export async function removeTeamMember(businessId: string, memberId: string): Promise<void> {
    await api.delete(`/team/${businessId}/member/${memberId}`);
}

export async function revokeTeamInvite(businessId: string, inviteId: string): Promise<void> {
    await api.delete(`/team/${businessId}/invite/${inviteId}`);
}
