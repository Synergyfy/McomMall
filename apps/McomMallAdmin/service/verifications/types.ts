export type VerificationSubjectType = 'identity' | 'business';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Verification {
    id: string;
    subjectType: VerificationSubjectType;
    subjectId?: string | null;
    subjectName: string;
    documentType: string;
    documentUrl?: string;
    status: VerificationStatus;
    reviewNote?: string;
    reviewedBy?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface VerificationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface ReviewVerificationDto {
    reviewNote?: string;
}
