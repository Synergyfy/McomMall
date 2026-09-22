import api from '@/service/api';
import {
    ServiceTemplateRecord,
    CreateServiceTemplateDto,
    UpdateServiceTemplateDto,
} from './types';

const ENDPOINT = '/service-templates';

export async function getServiceTemplates(search?: string): Promise<ServiceTemplateRecord[]> {
    const { data } = await api.get<ServiceTemplateRecord[]>(ENDPOINT, {
        params: search ? { search } : undefined,
    });
    return data;
}

export async function createServiceTemplate(dto: CreateServiceTemplateDto): Promise<ServiceTemplateRecord> {
    const { data } = await api.post<ServiceTemplateRecord>(ENDPOINT, dto);
    return data;
}

export async function updateServiceTemplate(
    id: string,
    dto: UpdateServiceTemplateDto,
): Promise<ServiceTemplateRecord> {
    const { data } = await api.patch<ServiceTemplateRecord>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteServiceTemplate(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
