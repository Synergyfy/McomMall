export type PayPalPurchasePurpose = 'gift-card' | 'voucher' | 'coupon';

export interface PendingPayPalPurchase {
  purpose: PayPalPurchasePurpose;
  purchaseDetails: Record<string, unknown>;
  createdAt: number;
}

const PENDING_KEY = 'mcom_paypal_pending_purchase';

/**
 * PayPal is driven by MCOM Central's merchant account, so the approval page
 * must return to a mall route that can finish the purchase. The purchase
 * context is kept in sessionStorage because the redirect loses React state.
 */
export function buildPayPalReturnUrls() {
  if (typeof window === 'undefined') {
    return { returnUrl: undefined, cancelUrl: undefined };
  }
  const base = `${window.location.origin}/payment/paypal/return`;
  const returnTo = `${window.location.pathname}${window.location.search}`;
  return {
    returnUrl: `${base}?returnTo=${encodeURIComponent(returnTo)}`,
    cancelUrl: `${base}?cancel=1&returnTo=${encodeURIComponent(returnTo)}`,
  };
}

export function storePendingPayPalPurchase(
  purpose: PayPalPurchasePurpose,
  purchaseDetails: Record<string, unknown>,
) {
  if (typeof window === 'undefined') return;
  const pending: PendingPayPalPurchase = {
    purpose,
    purchaseDetails,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function readPendingPayPalPurchase(): PendingPayPalPurchase | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingPayPalPurchase;
    if (!parsed?.purpose || !parsed?.purchaseDetails) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPayPalPurchase() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_KEY);
}
