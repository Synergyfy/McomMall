export type TrainingKind = 'course' | 'webinar' | 'doc';

export interface TrainingModuleRecord {
    id: string;
    title: string;
    kind: TrainingKind;
    description?: string;
    contentUrl?: string;
    durationMinutes?: number;
    isPublished: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTrainingModuleDto {
    title: string;
    kind: TrainingKind;
    description?: string;
    contentUrl?: string;
    durationMinutes?: number;
    isPublished?: boolean;
}
