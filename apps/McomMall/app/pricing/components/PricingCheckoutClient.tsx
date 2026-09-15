'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useRecordPayment,
  useCreateStripeIntent,
  useCreatePayPalOrder,
  useWalletBalance,
  useInitiateWalletHold,
} from '@/service/payments/hooks';
import {
  PaymentGateway,
  PlanType,
  PaygOption,
  PaymentPurpose,
  CreateStripeIntentRequest,
  CreatePaypalOrderRequest
} from '@/service/payments/types';
import SubscriptionSummary from './SubscriptionSummary';
import PaymentForm from '@/app/(public)/checkout/components/PaymentForm';
import WalletTopUpPanel from './WalletTopUpPanel';
import MembershipCardPanel from './MembershipCardPanel';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { PaymentMethod } from '@/service/bookings/types';
import { Button } from '@/components/ui/button';

interface PricingCheckoutClientProps {
  planName: string;
  planPrice: string;
  isTrial: boolean;
  isPayg?: boolean;
  listingId: string | null;
  tierId?: string;
  planType?: PlanType;
  planVariantId?: string;
}

export default function PricingCheckoutClient({
  planName,
  planPrice,
  isTrial,
  isPayg,
  tierId,
  planType,
  planVariantId,
}: PricingCheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeRedirect = searchParams.get('stripe_redirect');

  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );
  // Membership offers three rails: MCOM Wallet debit, card and PayPal —
  // card/PayPal money is processed centrally by MCOM Solutions, the mall
  // only proxies initiate/confirm and records the membership locally.
  // PAYG keeps the legacy mall-direct Card / PayPal path below.
  const [payRail, setPayRail] = useState<'wallet' | 'card' | 'paypal'>('wallet');
  const paypalReturnState = searchParams.get('paypal');
  const paypalOrderToken = searchParams.get('token');
  const paypalReturnHandled = useRef(false);
  const getPriceAsNumber = (price: string) => {
    const numericPart = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericPart);
  };

  const totalPrice = isTrial ? 1.0 : getPriceAsNumber(planPrice);
  const walletEnabled = !isPayg;

  const {
    data: walletBalance,
    isLoading: isLoadingWalletBalance,
    refetch: refetchWalletBalance,
  } = useWalletBalance(walletEnabled);

  const { mutate: recordPayment, mutateAsync: recordPaymentAsync, isPending: isRecordingPayment } =
    useRecordPayment();
  const {
    mutateAsync: createStripeIntent,
    data: stripeIntent,
    isPending: isCreatingStripeIntent,
  } = useCreateStripeIntent();
  const {
    mutateAsync: createPayPalOrder,
    data: payPalOrder,
    isPending: isCreatingPayPalOrder,
  } = useCreatePayPalOrder();

  const walletIdempotencyKey = useRef<string | null>(null);

  const {
    mutateAsync: initiateWalletHold,
    isPending: isPlacingWalletHold,
  } = useInitiateWalletHold();

  useEffect(() => {
    // Membership is wallet-only: funds are reserved server-side via holds —
    // no Stripe intent / PayPal order is needed. PAYG keeps the legacy path.
    if (walletEnabled) return;
    // Only fetch intent/order if we have valid conditions:
    // 1. Not a stripe redirect (which means we are coming back from stripe)
    // 2. Either (totalPrice > 0 OR it's a membership with tierId)
    // Note: Membership trial might be 0 or small amount, but backend logic handles it.
    if (!stripeRedirect) {
      if (paymentMethod === PaymentMethod.STRIPE) {
        const payload: CreateStripeIntentRequest = {};
        if (isPayg) {
          payload.purpose = PaymentPurpose.PAYG_TOPUP;
          payload.amount = Math.round(totalPrice * 100);
        } else if (planVariantId || (tierId && planType)) {
          payload.purpose = PaymentPurpose.MEMBERSHIP;
          if (planVariantId) {
            // New plans model: backend prices from the variant's active price
            payload.planVariantId = planVariantId;
          } else {
            payload.tierId = tierId;
            payload.planType = planType;
          }
        } else {
          // Fallback or incomplete data, maybe just return
          return;
        }
        createStripeIntent(payload);
      } else {
        const payload: CreatePaypalOrderRequest = {};
        if (isPayg) {
          payload.purpose = PaymentPurpose.PAYG_TOPUP;
          payload.amount = totalPrice;
        } else if (planVariantId || (tierId && planType)) {
          payload.purpose = PaymentPurpose.MEMBERSHIP;
          if (planVariantId) {
            payload.planVariantId = planVariantId;
          } else {
            payload.tierId = tierId;
            payload.planType = planType;
          }
        } else {
          return;
        }
        createPayPalOrder(payload);
      }
    }
  }, [
    totalPrice,
    paymentMethod,
    walletEnabled,
    createStripeIntent,
    createPayPalOrder,
    stripeRedirect,
    isPayg,
    tierId,
    planType,
    planVariantId
  ]);

  // PayPal approved on paypal.com and redirected back here (?paypal=return
  // &token=<orderId>). Complete the purchase once: Solutions captures the
  // order server-side during record, then the membership is recorded.
  useEffect(() => {
    if (!walletEnabled) return;
    if (paypalReturnState !== 'return' || !paypalOrderToken) return;
    if (paypalReturnHandled.current) return;
    paypalReturnHandled.current = true;
    setPayRail('paypal');
    recordPaymentAsync({
      amount: totalPrice,
      planType: planType || PlanType.MONTHLY,
      purpose: PaymentPurpose.MEMBERSHIP,
      isTrial,
      paymentGateway: PaymentGateway.PAYPAL,
      transactionId: paypalOrderToken,
      currency: 'gbp',
      tierId,
      planVariantId,
      viaSolutions: true,
    }).then(() => setSuccessModalOpen(true)).catch(() => {
      // Error toast already shown by useRecordPayment.
    });
  }, [
    walletEnabled,
    paypalReturnState,
    paypalOrderToken,
    recordPaymentAsync,
    totalPrice,
    planType,
    isTrial,
    tierId,
    planVariantId,
  ]);

  const getPaygOption = (name: string): PaygOption | undefined => {
    if (name.includes('90')) return PaygOption.NINETY_DAYS;
    if (name.includes('180')) return PaygOption.ONE_EIGHTY_DAYS;
    if (name.includes('270')) return PaygOption.TWO_SEVENTY_DAYS;
    return undefined;
  };

  const handlePaymentSuccess = useCallback(
    (transactionId: string, paymentMethod: PaymentMethod) => {
      const purpose = isPayg ? PaymentPurpose.PAYG_TOPUP : PaymentPurpose.MEMBERSHIP;
      const recordPlanType = isPayg ? PlanType.PAYG : (planType || PlanType.MONTHLY);

      recordPayment(
        {
          amount: totalPrice,
          planType: recordPlanType,
          purpose,
          paygOption: isPayg ? getPaygOption(planName) : undefined,
          isTrial,
          paymentGateway:
            paymentMethod === PaymentMethod.STRIPE
              ? PaymentGateway.STRIPE
              : PaymentGateway.PAYPAL,
          transactionId,
          currency: 'gbp',
          tierId: isPayg ? undefined : tierId,
          planVariantId: isPayg ? undefined : planVariantId,
        },
        {
          onSuccess: () => setSuccessModalOpen(true),
        }
      );
    },
    [totalPrice, isPayg, planName, isTrial, recordPayment, planType, tierId, planVariantId]
  );

  const [isPayingWithWallet, setIsPayingWithWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleWalletPay = useCallback(async () => {
    setWalletError(null);
    // One idempotency key per checkout attempt — reused across retries so a
    // double-click or network retry can never place two holds.
    if (!walletIdempotencyKey.current) {
      walletIdempotencyKey.current =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    setIsPayingWithWallet(true);
    try {
      const hold = await initiateWalletHold({
        paymentProvider: 'mcom_wallet',
        planVariantId,
        tierId,
        planType,
        idempotencyKey: walletIdempotencyKey.current,
      });
      const recordPlanType = planType || PlanType.MONTHLY;
      await recordPaymentAsync({
        amount: totalPrice,
        planType: recordPlanType,
        purpose: PaymentPurpose.MEMBERSHIP,
        isTrial,
        paymentGateway: PaymentGateway.MCOM_WALLET,
        transactionId: hold.holdId,
        holdId: hold.holdId,
        currency: 'mcom',
        tierId,
        planVariantId,
      });
      walletIdempotencyKey.current = null;
      setSuccessModalOpen(true);
    } catch (e: any) {
      // Keep the key so an immediate retry reuses it (safe); clear only on success.
      setWalletError(e?.message || 'Wallet payment failed. Please try again.');
    } finally {
      setIsPayingWithWallet(false);
    }
  }, [
    initiateWalletHold,
    planVariantId,
    tierId,
    planType,
    recordPaymentAsync,
    totalPrice,
    isTrial,
  ]);

  const walletAvailable = walletBalance?.availableBalance ?? null;
  const walletInsufficient =
    walletAvailable !== null && walletAvailable < totalPrice;

  if (isRecordingPayment || isCreatingStripeIntent || isCreatingPayPalOrder) {
    return (
      <div className="mx-auto w-full max-w-6xl" aria-busy="true" aria-label="Preparing secure checkout">
        <div className="flex items-center gap-4 py-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
            <ShieldCheck className="h-6 w-6 text-[#ff6900]" />
          </span>
          <div>
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3.5 w-64 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 animate-pulse rounded bg-gray-100" />
              <div className="h-4 animate-pulse rounded bg-gray-100" />
              <div className="h-8 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-12 animate-pulse rounded-xl bg-gray-100" />
            <div className="mt-3 h-12 animate-pulse rounded-xl bg-gray-100" />
            <div className="mt-6 h-11 animate-pulse rounded-xl bg-orange-100" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Preparing your secure checkout…
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto w-full max-w-6xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Secure checkout
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Lock className="h-3.5 w-3.5" />
                {walletEnabled
                  ? '256-bit encrypted · Wallet, card & PayPal'
                  : '256-bit encrypted · Stripe & PayPal'}
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 text-xs font-bold text-[#ff6900]">
            {planName}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section className="rounded-3xl border border-gray-100 bg-white p-7 sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
            <SubscriptionSummary
              planName={planName}
              planPrice={planPrice}
              isTrial={isTrial}
              isPayg={isPayg}
              paygOption={getPaygOption(planName)}
              totalPrice={totalPrice}
            />

            <div className="mt-8 border-t border-gray-100 pt-6 space-y-5">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.14em]">
                Billing details
              </h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-gray-600">
                    Billing name
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp Ltd"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#ff6900] focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-gray-600">
                      Billing address
                    </span>
                    <input
                      type="text"
                      placeholder="10 Downing St"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#ff6900] focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-gray-600">
                      Postcode
                    </span>
                    <input
                      type="text"
                      placeholder="SW1A 2AA"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#ff6900] focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.14em]">
                  Promo code
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MCOM20"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm uppercase tracking-wider text-gray-800 placeholder:text-gray-400 placeholder:normal-case placeholder:tracking-normal focus:border-[#ff6900] focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                  <Button className="h-[46px] rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-700">
                    Apply
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-[#fcf8f6] p-4">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">
                      Apply voucher credits
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Available: £1,240.00 credit balance
                    </p>
                  </div>
                  <label className="relative inline-flex shrink-0 items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#ff6900] peer-focus-visible:ring-2 peer-focus-visible:ring-orange-200 transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-7 sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900">Payment</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                £{totalPrice.toFixed(2)} due today
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {walletEnabled ? (
                <>
                  <div
                    className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1.5"
                    role="tablist"
                    aria-label="Payment method"
                  >
                    {(
                      [
                        { rail: 'wallet', label: 'MCOM Wallet' },
                        { rail: 'card', label: 'Card' },
                        { rail: 'paypal', label: 'PayPal' },
                      ] as const
                    ).map(({ rail, label }) => (
                      <button
                        key={rail}
                        type="button"
                        role="tab"
                        aria-selected={payRail === rail}
                        onClick={() => setPayRail(rail)}
                        className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                          payRail === rail
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {paypalReturnState === 'cancelled' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-800">
                        PayPal payment was cancelled — no money moved. Pick a
                        payment method below to try again.
                      </p>
                    </div>
                  )}
                  {payRail === 'wallet' ? (
                  <div className="rounded-2xl border border-orange-100 bg-[#fcf8f6] p-5">
                  {isLoadingWalletBalance ? (
                    <p className="text-sm text-gray-500">Checking wallet balance…</p>
                  ) : walletBalance && walletBalance.linked === false ? (
                    <p className="text-sm text-gray-600">
                      MCOM Wallet is not linked. Please re-authenticate via SSO to use your wallet.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Available balance
                        </span>
                        <span className="text-lg font-extrabold text-gray-900">
                          {walletAvailable !== null
                            ? `${walletAvailable.toFixed(2)} MCOM`
                            : '—'}
                        </span>
                      </div>
                      {walletInsufficient ? (
                        <>
                          <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3">
                            <p className="text-xs font-semibold text-red-700">
                              Insufficient wallet balance. Top up by card below —
                              processed securely by MCOM Solutions.
                            </p>
                          </div>
                          <WalletTopUpPanel
                            suggestedAmount={Math.max(
                              0,
                              totalPrice - (walletAvailable ?? 0),
                            )}
                            topUpUrl={walletBalance?.topUpUrl}
                            onTopUpComplete={() => refetchWalletBalance()}
                          />
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">
                          {totalPrice.toFixed(2)} MCOM will be debited from your wallet.
                        </p>
                      )}
                      {walletError && (
                        <p className="mt-2 text-xs font-semibold text-red-600">{walletError}</p>
                      )}
                      <Button
                        onClick={handleWalletPay}
                        disabled={isPayingWithWallet || isPlacingWalletHold || isRecordingPayment || walletInsufficient}
                        className="mt-4 h-12 w-full rounded-xl bg-[#ff6900] text-sm font-bold text-white hover:bg-[#e65c00] disabled:opacity-50"
                      >
                        {isPayingWithWallet || isPlacingWalletHold
                          ? 'Processing…'
                          : `Pay ${totalPrice.toFixed(2)} MCOM`}
                      </Button>
                    </>
                  )}
                    </div>
                  ) : (
                    <MembershipCardPanel
                      method={payRail}
                      planName={planName}
                      planPrice={planPrice}
                      planVariantId={planVariantId}
                      tierId={tierId}
                      planType={planType}
                      totalPrice={totalPrice}
                      isTrial={isTrial}
                      onPaymentComplete={() => setSuccessModalOpen(true)}
                    />
                  )}
                </>
              ) : (
              <PaymentForm
                totalPrice={totalPrice}
                onPaymentSuccess={(transactionId) =>
                  handlePaymentSuccess(
                    transactionId,
                    paymentMethod
                  )
                }
                clientSecret={stripeIntent?.clientSecret}
                orderID={payPalOrder?.id}
                setPaymentMethod={setPaymentMethod}
              />
              )}
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              {walletEnabled
                ? 'All payments are processed centrally by MCOM Solutions.'
                : 'Card details never touch our servers — processed by Stripe & PayPal.'}
            </p>
          </section>
        </div>
      </motion.div>
      <SuccessDialog
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          router.push('/dashboard');
        }}
      />
    </>
  );
}
