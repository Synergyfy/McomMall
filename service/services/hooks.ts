import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import api from '../api';
import { IService } from './types';
import { IUser } from '@/service/user/types';

// --- TYPES ---

// As per API doc: /partnerships/request
interface CreatePartnershipDto {
  providerId: string;
}

// As per API doc: /partnerships/request response
interface Partnership {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester: IUser;
  provider: IUser;
  created_at: string;
  updated_at: string;
}

// --- HOOKS ---

/**
 * Fetches services based on a search term.
 * GET /services/search
 */

async function searchServicesFetcher(url: string, { arg: term }: { arg: string }): Promise<IService[]> {
    return api.get(`${url}?term=${encodeURIComponent(term)}`).then(res => res.data);
}

export function useSearchServices() {
    const { data, error, isMutating, trigger } = useSWRMutation(
        '/services/search',
        searchServicesFetcher
    );

    return {
        searchResults: data,
        isSearching: isMutating,
        searchError: error,
        search: trigger,
    };
}

/**
 * Sends a partnership request to a service provider.
 * POST /partnerships/request
 */
async function requestPartnership(url: string, { arg }: { arg: CreatePartnershipDto }) {
  return await api.post<Partnership>(url, arg).then(res => res.data);
}

export function useRequestPartnership() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/partnerships/request',
    requestPartnership
  );

  return {
    mutate: trigger,
    isPending: isMutating,
    error,
    data,
  };
}