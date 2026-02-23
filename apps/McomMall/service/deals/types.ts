export interface Deal {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface DealsResponse {
    data: Deal[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}

export interface GetDealsParams {
    page?: number;
    limit?: number;
}
