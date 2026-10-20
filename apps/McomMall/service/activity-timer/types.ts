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

export interface ActivityTask {
    key: string;
    title: string;
    description: string;
    url: string;
    isCompleted: boolean;
}

export interface ActiveTimerResponse {
    id: string;
    type: ActivityTimerType;
    name: string;
    description: string;
    remainingTime: number; // in milliseconds
    expiresAt: string;     // ISO Date
    completedAt: string | null;
    isPaused: boolean;
    tasks: ActivityTask[];
}
