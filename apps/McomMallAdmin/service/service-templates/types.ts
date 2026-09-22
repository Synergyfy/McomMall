export interface ServiceTemplatePackage {
    name: string;
    price: number;
    duration: number;
    description: string;
    features: string[];
}

export interface ServiceTemplateRecord {
    id: string;
    name: string;
    category?: string;
    description?: string;
    packages: ServiceTemplatePackage[];
    requirements?: string[];
    isActive: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateServiceTemplateDto {
    name: string;
    category?: string;
    description?: string;
    packages?: ServiceTemplatePackage[];
    requirements?: string[];
    isActive?: boolean;
}

export interface UpdateServiceTemplateDto {
    name?: string;
    category?: string;
    description?: string;
    packages?: ServiceTemplatePackage[];
    requirements?: string[];
    isActive?: boolean;
}
