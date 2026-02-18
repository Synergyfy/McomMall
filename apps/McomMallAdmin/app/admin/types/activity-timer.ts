export enum ActivityTaskType {
    CREATE_BUSINESS = 'CREATE_BUSINESS',
    IMPORT_CONTACTS = 'IMPORT_CONTACTS',
    ADD_PRODUCT_SERVICE = 'ADD_PRODUCT_SERVICE',
    LIST_BARTER_OFFER = 'LIST_BARTER_OFFER',
    CONNECT_BUSINESS = 'CONNECT_BUSINESS',
    CREATE_PROMOTION = 'CREATE_PROMOTION',
    CREATE_COUPON = 'CREATE_COUPON',
    PAY_FOR_TIER = 'PAY_FOR_TIER',
}

export enum ActivityTimerType {
    TRIAL = 'TRIAL',
    GENERAL = 'GENERAL',
}

export interface PublishTaskDto extends ActivityTaskDto {
    type: ActivityTimerType;
    isForAllTiers?: boolean;
    includedTierIds?: string[];
    excludedTierIds?: string[];
    expiresAt?: string; // ISO Date
    actionUrl?: string;
}

export interface ActivityTaskDto {
    key: ActivityTaskType;
    title: string;
    description: string;
    actionUrl?: string; // Renamed from url to match backend
    durationDays?: number;
}

export interface ActivityTimerDefinition {
    id: string;
    title: string;
    description?: string;
    type: ActivityTimerType;
    key: string;
    actionUrl?: string;
    includedTierIds?: string[];
    excludedTierIds?: string[];
    durationDays?: number;
    expiresAt?: string;
    createdAt: string;
}

export interface TemplateFilters {
    type?: ActivityTimerType;
    isPublished?: boolean;
}

export type TemplateResponse = ActivityTimerDefinition[];
