import { useQuery } from '@tanstack/react-query';
import { getPlatformGames, getPlatformGameSummary } from './api';

export function useGetPlatformGames(status?: string) {
    return useQuery({
        queryKey: ['gamification', 'admin', status ?? 'all'],
        queryFn: () => getPlatformGames(status),
    });
}

export function useGetPlatformGameSummary() {
    return useQuery({
        queryKey: ['gamification', 'admin', 'summary'],
        queryFn: getPlatformGameSummary,
    });
}
