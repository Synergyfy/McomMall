import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'manager' | 'staff' | 'agent';
  status: 'active' | 'suspended';
  permissions: {
    storefront: boolean;
    analytics: boolean;
    orders: boolean;
    customers: boolean;
    marketing: boolean;
    inventory: boolean;
  };
  created_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: 'manager' | 'staff' | 'agent';
  status: 'pending' | 'accepted' | 'expired';
  permissions: {
    storefront: boolean;
    analytics: boolean;
    orders: boolean;
    customers: boolean;
    marketing: boolean;
    inventory: boolean;
  };
  expiresAt: string;
  created_at: string;
}

export interface TeamData {
  members: TeamMember[];
  invites: TeamInvite[];
}

export const useGetTeam = (businessId: string) => {
  const fetchTeam = async (): Promise<TeamData> => {
    const { data } = await api.get(`/team/${businessId}`);
    return data;
  };

  return useQuery({
    queryKey: ['team', businessId],
    queryFn: fetchTeam,
    enabled: !!businessId,
  });
};

export const useInviteMember = (businessId: string) => {
  const queryClient = useQueryClient();

  const invite = async (payload: {
    email: string;
    role: string;
    permissions: any;
  }) => {
    const { data } = await api.post(`/team/${businessId}/invite`, payload);
    return data;
  };

  return useMutation({
    mutationFn: invite,
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['team', businessId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    },
  });
};

export const useUpdateMember = (businessId: string) => {
  const queryClient = useQueryClient();

  const update = async ({
    memberId,
    ...payload
  }: {
    memberId: string;
    role?: string;
    status?: string;
    permissions?: any;
  }) => {
    const { data } = await api.patch(
      `/team/${businessId}/member/${memberId}`,
      payload
    );
    return data;
  };

  return useMutation({
    mutationFn: update,
    onSuccess: () => {
      toast.success('Team member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['team', businessId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update member');
    },
  });
};

export const useRemoveMember = (businessId: string) => {
  const queryClient = useQueryClient();

  const remove = async (memberId: string) => {
    const { data } = await api.delete(`/team/${businessId}/member/${memberId}`);
    return data;
  };

  return useMutation({
    mutationFn: remove,
    onSuccess: () => {
      toast.success('Member removed from team');
      queryClient.invalidateQueries({ queryKey: ['team', businessId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    },
  });
};

export const useRevokeInvite = (businessId: string) => {
  const queryClient = useQueryClient();

  const revoke = async (inviteId: string) => {
    const { data } = await api.delete(`/team/${businessId}/invite/${inviteId}`);
    return data;
  };

  return useMutation({
    mutationFn: revoke,
    onSuccess: () => {
      toast.success('Invitation cancelled');
      queryClient.invalidateQueries({ queryKey: ['team', businessId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel invitation');
    },
  });
};
