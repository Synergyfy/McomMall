// Shared implementation lives in @mcommall/payments. Keep this file as a thin
// re-export so existing `@/lib/payment-errors` imports keep working.
export {
  getPaymentErrorInfo,
  showPaymentError,
} from '@mcommall/payments';
export type { PaymentErrorInfo } from '@mcommall/payments';
