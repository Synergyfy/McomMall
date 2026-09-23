import api from '@/service/api';
import { QualityMission, MissionStats, CreateQualityMissionDto, UpdateQualityMissionDto } from './types';

const ENDPOINT = '/quality/missions';

export async function getQualityMissions(status?: string): Promise<QualityMission[]> {
    const { data } = await api.get<QualityMission[]>(ENDPOINT, {
        params: status ? { status } : undefined,
    });
    return data;
}

export async function getMissionStats(): Promise<MissionStats> {
    const { data } = await api.get<MissionStats>(`${ENDPOINT}/stats`);
    return data;
}

export async function createQualityMission(dto: CreateQualityMissionDto): Promise<QualityMission> {
    const { data } = await api.post<QualityMission>(ENDPOINT, dto);
    return data;
}

export async function updateQualityMission(
    id: string,
    dto: UpdateQualityMissionDto,
): Promise<QualityMission> {
    const { data } = await api.patch<QualityMission>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteQualityMission(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
