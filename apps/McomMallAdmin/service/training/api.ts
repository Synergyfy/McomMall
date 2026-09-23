import api from '@/service/api';
import { TrainingModuleRecord, CreateTrainingModuleDto } from './types';

const ENDPOINT = '/training';

export async function getTrainingModules(kind?: string): Promise<TrainingModuleRecord[]> {
    const { data } = await api.get<TrainingModuleRecord[]>(ENDPOINT, {
        params: kind ? { kind } : undefined,
    });
    return data;
}

export async function createTrainingModule(dto: CreateTrainingModuleDto): Promise<TrainingModuleRecord> {
    const { data } = await api.post<TrainingModuleRecord>(ENDPOINT, dto);
    return data;
}

export async function updateTrainingModule(
    id: string,
    dto: Partial<CreateTrainingModuleDto>,
): Promise<TrainingModuleRecord> {
    const { data } = await api.patch<TrainingModuleRecord>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteTrainingModule(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
