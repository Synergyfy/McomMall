'use client';

// Shared implementation lives in @mcommall/payments. Keep this file as a thin
// re-export so existing `@/components/StripeCheckoutForm` imports keep working.
export { StripeCheckoutForm } from '@mcommall/payments';
export type { StripeCheckoutFormProps } from '@mcommall/payments';
