export interface AssetCategory {
  id: string;
  name: string;
  ownerId: string;
  created_at: string;
  updated_at: string;
}

export interface GiftCardAsset {
  id: string;
  name: string;
  url: string;
  ownerId: string;
  created_at: string;
  updated_at: string;
  categories: AssetCategory[];
}