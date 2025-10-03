import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import api from '../api';
import { IUser } from '@/service/user/types';
import { IPartnership } from './types';

// --- API HELPERS ---

async function updatePartnershipStatus(url: string) {
  return await api.patch<IPartnership>(url, {}).then(res => res.data);
}

// --- HOOKS ---

/**
 * Fetches all partnerships for the current user.
 * GET /partnerships/my
 */
export function useMyPartnerships() {
  const { data, error, isLoading, mutate } = useSWR<IPartnership[]>(
    '/partnerships/my',
    (url: string) => api.get(url).then(res => res.data)
  );

  return {
    partnerships: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * Accepts a partnership request.
 * PATCH /partnerships/:id/accept
 */
export function useAcceptPartnership() {
  const { trigger, isMutating, error } = useSWRMutation(
    `/partnerships`, // Base key, will be appended with ID
    (url, { arg: id }: { arg: string }) => updatePartnershipStatus(`${url}/${id}/accept`)
  );

  return {
    acceptPartnership: trigger,
    isAccepting: isMutating,
    error,
  };
}

/**
 * Fetches a list of accepted partner users for the current user.
 * GET /partnerships/my/accepted-partners
 */
export function useMyAcceptedPartners() {
    const { data, error, isLoading, mutate } = useSWR<IUser[]>(
        '/partnerships/my/accepted-partners',
        (url: string) => api.get(url).then(res => res.data)
    );

    return {
        partners: data,
        isLoading,
        isError: !!error,
        mutate,
    };
}