'use client';

// Shared implementation lives in @mcommall/payments. Keep this file as a thin
// re-export so existing default imports keep working.
export { StripeCheckoutForm as default } from '@mcommall/payments';
export type { StripeCheckoutFormProps } from '@mcommall/payments';
