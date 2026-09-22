export type QrType = 'storefront' | 'product' | 'event' | 'promo' | 'reward';
export type QrStatus = 'active' | 'paused';

export interface QrCode {
    id: string;
    name: string;
    qrType: QrType;
    targetId?: string;
    status: QrStatus;
    scanCount: number;
    shortUrl?: string;
    businessId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateQrCodeDto {
    name?: string;
    qrType?: QrType;
    targetId?: string;
    status?: QrStatus;
    shortUrl?: string;
}
