import api from '@/service/api';
import {
    OnboardingQuestion,
    CreateOnboardingQuestionDto,
    UpdateOnboardingQuestionDto,
} from './types';

const ENDPOINT = '/onboarding/questions';

export async function getOnboardingQuestions(): Promise<OnboardingQuestion[]> {
    const { data } = await api.get<OnboardingQuestion[]>(ENDPOINT);
    return data;
}

export async function createOnboardingQuestion(
    dto: CreateOnboardingQuestionDto,
): Promise<OnboardingQuestion> {
    const { data } = await api.post<OnboardingQuestion>(ENDPOINT, dto);
    return data;
}

export async function updateOnboardingQuestion(
    id: string,
    dto: UpdateOnboardingQuestionDto,
): Promise<OnboardingQuestion> {
    const { data } = await api.patch<OnboardingQuestion>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function reorderOnboardingQuestions(ids: string[]): Promise<OnboardingQuestion[]> {
    const { data } = await api.patch<OnboardingQuestion[]>(`${ENDPOINT}/reorder`, { ids });
    return data;
}

export async function deleteOnboardingQuestion(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
