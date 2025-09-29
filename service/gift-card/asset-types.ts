import { Category } from './category-types';

export interface GiftCardAsset {
  id: string; // UUID
  name: string;
  url: string;
  ownerId: string; // User UUID
  categories: Category[];
}

export interface CreateGiftCardAssetDto {
  name: string;
  url: string; // URL to the GIF
  categoryIds?: string[]; // Array of Category UUIDs
}

export interface UpdateGiftCardAssetDto {
  name?: string;
  url?: string;
  categoryIds?: string[]; // Array of Category UUIDs
}