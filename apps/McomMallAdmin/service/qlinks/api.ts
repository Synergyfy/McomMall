import api from '@/service/api';
import { QrCode, UpdateQrCodeDto } from './types';

const ENDPOINT = '/qr-codes';

export async function getQrCodesByBusiness(businessId: string): Promise<QrCode[]> {
    const { data } = await api.get<QrCode[]>(ENDPOINT, { params: { businessId } });
    return data;
}

export async function updateQrCode(id: string, dto: UpdateQrCodeDto): Promise<QrCode> {
    const { data } = await api.patch<QrCode>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteQrCode(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
