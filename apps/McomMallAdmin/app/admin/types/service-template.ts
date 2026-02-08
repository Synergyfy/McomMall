export interface ServicePackage {
    id?: string;
    name: string; // e.g. "Basic", "Premium"
    price: number;
    duration: number; // in minutes
    description: string;
    features: string[]; // List of what's included
}

export interface ServiceTemplate {
    id?: string;
    name: string;
    category: string;
    description: string;
    packages: ServicePackage[];
    requirements: string[]; // e.g. "Safety Gear", "Insurance"
}
