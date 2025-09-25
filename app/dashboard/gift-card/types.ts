// types.ts

export interface RedemptionRules {
  canBeUsedWithDiscounts: boolean;
  canApplyToShipping: boolean;
  canApplyToTax: boolean;
}

export interface GiftCardSettings {
  isEnabled: boolean;
  allowDeliveryScheduling: boolean;
  allowPersonalMessage: boolean;
  enableQrCode: boolean;
  allowReloading: boolean;
  redemptionRules: RedemptionRules;
}

import { ElementType, ReactNode } from 'react';

export type UpdateGiftCardSettingsDto = Partial<GiftCardSettings>;

export interface GiftCardDesign {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  icon: ElementType;
  pattern: ReactNode;
}