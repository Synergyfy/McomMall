export interface Sector {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  sectorId: string;
}

export interface SubCategory {
  id: string;
  name: string;
  image?: string;
  description?: string;
  categoryId: string;
}
