export interface GiftCardAsset {
  id: string; // UUID
  name: string;
  url: string;
  ownerId: string; // User UUID
}

export interface CreateGiftCardAssetDto {
  name: string;
  url: string; // URL to the GIF
}

export interface UpdateGiftCardAssetDto {
  name?: string;
  url?: string;
}