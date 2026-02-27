import api from '@/service/api';

export interface Season {
    id: string;
    name: string;
    description?: string;
    image?: string;
    startDate: string;
    endDate: string;
}

export interface CreateSeasonDto {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
}

// GET /seasons
export const getSeasons = async (): Promise<Season[]> => {
    const { data } = await api.get('/seasons');
    return data;
};

// POST /seasons (admin only)
export const createSeason = async (dto: CreateSeasonDto): Promise<Season> => {
    const { data } = await api.post('/seasons', dto);
    return data;
};
