import { toast } from 'sonner';

export interface PaymentErrorInfo {
  message: string;
  code?: string;
  topUpUrl?: string;
}

/**
 * Normalise MCOM Pay / API failures into something a shopper can act on.
 *
 * The mall API returns `{ error: CODE, message, topUpUrl? }` for MCOM Pay
 * failures, while older endpoints sometimes return `{ success: false, message }`
 * or a plain string. Keep the mapping in one place so the gift-card, voucher
 * and coupon modals behave consistently.
 */
export function getPaymentErrorInfo(error: unknown): PaymentErrorInfo {
  const err = error as {
    response?: { data?: Record<string, unknown> | string };
    message?: string;
  };
  const data = err?.response?.data;
  const record = data && typeof data === 'object' ? data : undefined;
  const code =
    (record?.error as string | undefined) ||
    (record?.code as string | undefined);
  const rawMessage =
    (record?.message as string | undefined) ||
    (typeof data === 'string' ? data : undefined) ||
    err?.message;
  const topUpUrl = record?.topUpUrl as string | undefined;

  if (code === 'WALLET_INSUFFICIENT_FUNDS' || /insufficient/i.test(rawMessage ?? '')) {
    return {
      code: code ?? 'WALLET_INSUFFICIENT_FUNDS',
      message:
        'Your MCOM Wallet balance is too low for this purchase. Top up and try again.',
      topUpUrl,
    };
  }

  if (code === 'CHARGE_ALREADY_USED' || code === 'PAYMENT_ALREADY_RECORDED') {
    return {
      code,
      message:
        'This payment has already been linked to another purchase. Please start a new payment.',
    };
  }

  if (code === 'SERVICE_UNAVAILABLE') {
    return {
      code,
      message:
        'Payments are temporarily unavailable. Please try again in a moment.',
    };
  }

  if (code === 'INVALID_SIGNATURE' || code === 'UNAUTHORIZED') {
    return {
      code,
      message:
        'We could not confirm the payment provider. Please contact support if you were charged.',
    };
  }

  return {
    code,
    message: rawMessage || 'Payment failed. Please try again.',
    topUpUrl,
  };
}

export function showPaymentError(error: unknown) {
  const info = getPaymentErrorInfo(error);
  if (info.topUpUrl) {
    toast.error(info.message, {
      action: {
        label: 'Top up',
        onClick: () => {
          window.location.href = info.topUpUrl!;
        },
      },
    });
    return;
  }
  toast.error(info.message);
}
