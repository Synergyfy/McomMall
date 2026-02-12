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

export interface ActivityTaskDto {
    key: ActivityTaskType;
    title: string;
    description: string;
    url: string;
    durationDays: number;
}

export interface ActivityTask extends ActivityTaskDto {
    isCompleted?: boolean;
}

export interface CreateTemplateDto {
    name: string;
    description?: string;
    type: ActivityTimerType;
    durationDays: number;
    isPublished?: boolean;
    isForAllTiers?: boolean;
    includedTierIds?: string[];
    excludedTierIds?: string[];
    startTime?: string; // ISO Date
    endTime?: string;   // ISO Date
    tasks: ActivityTaskDto[];
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> { }

export interface ActivityTimerTemplate {
    id: string;
    name: string;
    description?: string;
    type: ActivityTimerType;
    durationDays: number;
    isPublished: boolean;
    isForAllTiers: boolean;
    includedTierIds: string[];
    excludedTierIds: string[];
    startTime?: string;
    endTime?: string;
    tasks: ActivityTaskDto[];
    createdAt: string;
    updatedAt: string;
}

export interface TemplateFilters {
    type?: ActivityTimerType;
    isPublished?: boolean;
}

export type TemplateResponse = ActivityTimerTemplate[];
