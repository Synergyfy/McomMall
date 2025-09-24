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

export type UpdateGiftCardSettingsDto = Partial<GiftCardSettings>;