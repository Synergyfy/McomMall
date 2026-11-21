'use client';

// Shared implementation lives in @mcommall/payments. Keep this file as a thin
// re-export so existing `@/components/PayPalCheckoutButton` imports keep working.
export { PayPalCheckoutButton } from '@mcommall/payments';
export type { PayPalCheckoutButtonProps } from '@mcommall/payments';
