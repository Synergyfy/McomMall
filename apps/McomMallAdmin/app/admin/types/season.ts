export interface Season {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    durationType: 'monthly' | 'quarterly' | 'annual';
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateSeasonInput = Omit<Season, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSeasonInput = Partial<CreateSeasonInput>;
