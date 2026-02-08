export interface AssetCategory {
  id: string;
  name: string;
  ownerId: string;
}

export interface CreateAssetCategoryDto {
  name: string;
}

export interface UpdateAssetCategoryDto {
  name?: string;
}