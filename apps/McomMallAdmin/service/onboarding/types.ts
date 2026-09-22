export type OnboardingInputType = 'text' | 'textarea' | 'yesno' | 'image';

export interface OnboardingQuestion {
    id: string;
    title: string;
    prompt: string;
    inputType: OnboardingInputType;
    displayOrder: number;
    isRequired: boolean;
    isActive: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateOnboardingQuestionDto {
    title: string;
    prompt: string;
    inputType: OnboardingInputType;
    displayOrder?: number;
    isRequired?: boolean;
    isActive?: boolean;
}

export interface UpdateOnboardingQuestionDto {
    title?: string;
    prompt?: string;
    inputType?: OnboardingInputType;
    displayOrder?: number;
    isRequired?: boolean;
    isActive?: boolean;
}
