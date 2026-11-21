'use client';

// Shared implementation lives in @mcommall/payments. Keep this file as a thin
// re-export so existing default imports keep working.
export { PayPalCheckoutButton as default } from '@mcommall/payments';
export type { PayPalCheckoutButtonProps } from '@mcommall/payments';
