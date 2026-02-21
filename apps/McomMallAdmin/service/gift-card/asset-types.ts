import { AssetCategory } from './asset-category-types';

export interface GiftCardAsset {
  id: string; // UUID
  name: string;
  url: string;
  ownerId: string; // User UUID
  categories: AssetCategory[];
}

export interface CreateGiftCardAssetDto {
  name: string;
  url: string; // URL to the GIF
  assetCategoryIds?: string[]; // Array of AssetCategory UUIDs
}

export interface UpdateGiftCardAssetDto {
  name?: string;
  url?: string;
  assetCategoryIds?: string[]; // Array of AssetCategory UUIDs
}