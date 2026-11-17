'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet } from 'lucide-react';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/service/bookings/types';
import { useWalletBalance } from '@/service/payments/hooks';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
  totalPrice: number;
  onPaymentSuccess: (orderId: string, method?: PaymentMethod) => void;
  clientSecret?: string;
  orderID?: string;
  setPaymentMethod: (method: PaymentMethod) => void;
  allowWallet?: boolean;
}

export default function PaymentForm({
  totalPrice,
  onPaymentSuccess,
  clientSecret,
  orderID,
  setPaymentMethod,
  allowWallet = true,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );
  const { data: wallet, isLoading: isWalletLoading } = useWalletBalance(
    selectedMethod === PaymentMethod.MCOM_WALLET
  );

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentMethod(method);
  };

  const handleWalletPay = () => {
    setPaymentMethod(PaymentMethod.MCOM_WALLET);
    onPaymentSuccess('mcom_wallet', PaymentMethod.MCOM_WALLET);
  };

  // Discounts can cover the whole order (Coupon Voucher, Voucher Coupon,
  // cashback). In that case there is nothing to charge, but the order still
  // needs to be placed and the instruments consumed.
  if (totalPrice <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Payment Details
        </h2>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 space-y-4">
          <p className="text-lg font-bold text-emerald-800">
            No payment needed
          </p>
          <p className="text-sm text-emerald-700">
            Your discounts cover the full order. Place the order to redeem the
            instruments in your wallet.
          </p>
          <Button
            type="button"
            onClick={() => {
              const transactionId =
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                  ? `free-${crypto.randomUUID()}`
                  : `free-${Date.now()}`;
              setPaymentMethod(PaymentMethod.STRIPE);
              onPaymentSuccess(transactionId, PaymentMethod.STRIPE);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-bold"
          >
            Place order — £0.00
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Payment Details</h2>
      <div
        className={`grid grid-cols-1 ${
          allowWallet ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
        } gap-4`}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleMethodChange(PaymentMethod.STRIPE)}
            variant={
              selectedMethod === PaymentMethod.STRIPE ? 'default' : 'outline'
            }
            className={`w-full h-16 sm:h-20 text-base sm:text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
              selectedMethod === PaymentMethod.STRIPE
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white'
            }`}
          >
            <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
            <span>Credit Card</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleMethodChange(PaymentMethod.PAYPAL)}
            variant={
              selectedMethod === PaymentMethod.PAYPAL ? 'default' : 'outline'
            }
            className={`w-full h-16 sm:h-20 text-base sm:text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
              selectedMethod === PaymentMethod.PAYPAL
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white'
            }`}
          >
            <Wallet className="h-7 w-7" />
            <span>PayPal</span>
          </Button>
        </motion.div>
        {allowWallet && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleMethodChange(PaymentMethod.MCOM_WALLET)}
              variant={
                selectedMethod === PaymentMethod.MCOM_WALLET
                  ? 'default'
                  : 'outline'
              }
              className={`w-full h-16 sm:h-20 text-base sm:text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
                selectedMethod === PaymentMethod.MCOM_WALLET
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white'
              }`}
            >
              <Wallet className="h-7 w-7" />
              <span>MCOM Wallet</span>
            </Button>
          </motion.div>
        )}
      </div>

      <div className="mt-6">
        {selectedMethod === PaymentMethod.STRIPE && clientSecret && (
          <motion.div
            key="stripe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StripeCheckoutForm
              clientSecret={clientSecret}
              onPaymentSuccess={onPaymentSuccess}
            />
          </motion.div>
        )}
        {selectedMethod === PaymentMethod.PAYPAL && orderID && (
          <motion.div
            key="paypal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PayPalCheckoutButton
              orderID={orderID}
              onPaymentSuccess={onPaymentSuccess}
            />
          </motion.div>
        )}
        {allowWallet && selectedMethod === PaymentMethod.MCOM_WALLET && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4"
          >
            {isWalletLoading ? (
              <p className="text-sm text-gray-500">Loading wallet balance…</p>
            ) : wallet?.linked === false ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  Link your MCOM account to use your wallet.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (wallet?.topUpUrl) window.location.href = wallet.topUpUrl;
                  }}
                >
                  Open MCOM Wallet
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Available balance
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {formatCurrency(Number(wallet?.availableBalance ?? 0))}
                  </p>
                  <p className="text-xs text-gray-500">
                    Order total {formatCurrency(totalPrice)}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleWalletPay}
                  disabled={
                    Number(wallet?.availableBalance ?? 0) < totalPrice
                  }
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {Number(wallet?.availableBalance ?? 0) < totalPrice
                    ? 'Insufficient balance'
                    : 'Pay with MCOM Wallet'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
