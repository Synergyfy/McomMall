export interface TemplateAttributeOption {
    name: string;
    priceModifier?: number;
}

export interface TemplateAttribute {
    name: string;
    options: string[]; // API expects strings based on user request example
}

export interface ProductTemplate {
    id: string;
    name: string;
    productType: string;
    category: string;
    subCategory: string;
    attributes: TemplateAttribute[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductTemplatePayload {
    name: string;
    productType: string;
    category: string;
    subCategory: string;
    attributes: TemplateAttribute[];
}

export interface UpdateProductTemplatePayload extends Partial<CreateProductTemplatePayload> { }

export interface ProductTemplateResponse {
    data: ProductTemplate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface TemplateFilters {
    page?: number;
    limit?: number;
    search?: string;
}
