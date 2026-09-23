import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getBusinessTeam,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
    revokeTeamInvite,
} from './api';
import { InviteMemberDto, UpdateMemberDto } from './types';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetBusinessTeam(businessId: string | undefined) {
    return useQuery({
        queryKey: businessId ? ['team', businessId] : ['team', 'none'],
        queryFn: () => getBusinessTeam(businessId as string),
        enabled: !!businessId,
    });
}

export function useInviteTeamMember(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: InviteMemberDto) => inviteTeamMember(businessId as string, dto),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: ['team', businessId] });
            toast.success('Invite sent');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to send invite')),
    });
}

export function useUpdateTeamMember(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ memberId, dto }: { memberId: string; dto: UpdateMemberDto }) =>
            updateTeamMember(businessId as string, memberId, dto),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: ['team', businessId] });
            toast.success('Member updated');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to update member')),
    });
}

export function useRemoveTeamMember(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (memberId: string) => removeTeamMember(businessId as string, memberId),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: ['team', businessId] });
            toast.success('Member removed');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to remove member')),
    });
}

export function useRevokeTeamInvite(businessId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (inviteId: string) => revokeTeamInvite(businessId as string, inviteId),
        onSuccess: () => {
            if (businessId) queryClient.invalidateQueries({ queryKey: ['team', businessId] });
            toast.success('Invite revoked');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to revoke invite')),
    });
}
