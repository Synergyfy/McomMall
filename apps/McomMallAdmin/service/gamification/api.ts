import api from '@/service/api';
import { PlatformGame, GamificationSummary } from './types';

export async function getPlatformGames(status?: string): Promise<PlatformGame[]> {
    const { data } = await api.get<PlatformGame[]>('/gamification/admin/all', {
        params: status ? { status } : undefined,
    });
    return data;
}

export async function getPlatformGameSummary(): Promise<GamificationSummary> {
    const { data } = await api.get<GamificationSummary>('/gamification/admin/summary');
    return data;
}
