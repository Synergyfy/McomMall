export interface Webhook {
    id: string;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
    lastTriggeredAt?: string;
    failureCount: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateWebhookDto {
    name: string;
    url: string;
    events?: string[];
    secret?: string;
    isActive?: boolean;
}

export interface UpdateWebhookDto {
    name?: string;
    url?: string;
    events?: string[];
    secret?: string;
    isActive?: boolean;
}
