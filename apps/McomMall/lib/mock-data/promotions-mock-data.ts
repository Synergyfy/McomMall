export type PromotionTypeTag = 'flash' | 'daily' | 'borough' | 'nearby' | 'seasonal' | 'high_street';

export interface PromotionItem {
  id: string;
  title: string;
  lat?: number;
  lng?: number;
  businessName: string;
  benefitValue: string;
  description: string;
  longDescription: string;
  locationTag?: string;
  borough?: string;
  distance?: string;
  expiryText: string;
  expiresAt?: string;
  promotionType: PromotionTypeTag;
  image: string;
  badgeIcon: string;
  isUrgent?: boolean;
  isHot?: boolean;
  termsAndConditions?: string;
  qrCode?: string;
  redeemCode?: string;
  usageLimit?: number;
  usageCount?: number;
  discountValue?: string;
  campaignName?: string;
  unlockCondition?: string;
  unlockRewardDescription?: string;
  isUnlocked?: boolean;
  unlockProgress?: number;
  unlockTarget?: number;
}

export type PromotionsTab = 'all' | 'nearby' | 'flash' | 'borough' | 'saved' | 'expiring';

export const PROMOTION_TYPE_CONFIG: Record<PromotionTypeTag, { label: string; bg: string; text: string }> = {
  flash: { label: 'Flash Deal', bg: 'bg-rose-100', text: 'text-rose-700' },
  daily: { label: 'Daily Deal', bg: 'bg-sky-100', text: 'text-sky-700' },
  borough: { label: 'Borough', bg: 'bg-amber-100', text: 'text-amber-700' },
  nearby: { label: 'Nearby', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  seasonal: { label: 'Seasonal', bg: 'bg-purple-100', text: 'text-purple-700' },
  high_street: { label: 'High Street', bg: 'bg-indigo-100', text: 'text-indigo-700' },
};