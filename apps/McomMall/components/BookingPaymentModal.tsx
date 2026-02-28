'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, Loader2 } from 'lucide-react';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { useInitiatePayment, useVerifyPayment } from '@/service/bookings/hook';
import { PaymentMethod } from '@/service/bookings/types';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess: () => void;
}

export default function BookingPaymentModal({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
}: BookingPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [orderID, setOrderID] = useState<string | undefined>();
  const [amount, setAmount] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const initiatePaymentMutation = useInitiatePayment();
  const verifyPaymentMutation = useVerifyPayment();

  useEffect(() => {
    if (isOpen && bookingId && !clientSecret && !orderID && !initiatePaymentMutation.isPending) {
      handleInitiatePayment(paymentMethod);
    }
  }, [isOpen, bookingId, paymentMethod, clientSecret, orderID]);

  // Reset when method changes to allow switching between Stripe/PayPal
  const switchMethod = (method: PaymentMethod) => {
    if (method !== paymentMethod) {
        setClientSecret(undefined);
        setOrderID(undefined);
        setPaymentMethod(method);
    }
  };

  const handleInitiatePayment = async (method: PaymentMethod) => {
    try {
      const provider = method === PaymentMethod.STRIPE ? 'stripe' : 'paypal';
      const response = await initiatePaymentMutation.mutateAsync({
        bookingId,
        paymentProvider: provider,
      });

      setAmount(response.amount);
      if (method === PaymentMethod.STRIPE) {
        setClientSecret(response.clientSecret);
      } else {
        setOrderID(response.orderId);
      }
    } catch (error) {
      console.error('Failed to initiate payment', error);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const provider = paymentMethod === PaymentMethod.STRIPE ? 'stripe' : 'paypal';
      await verifyPaymentMutation.mutateAsync({
        bookingId,
        amount,
        paymentProvider: provider,
        transactionId,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to verify payment', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-3xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900">Complete Payment</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Your funds will be held in escrow until the service is completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Amount Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
              <span className="text-slate-600 font-bold">Total to Pay</span>
              <span className="text-2xl font-black text-orange-600">
                {new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                }).format(amount)}
              </span>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={paymentMethod === PaymentMethod.STRIPE ? 'default' : 'outline'}
                className={`h-16 rounded-2xl flex flex-col gap-1 transition-all ${
                  paymentMethod === PaymentMethod.STRIPE 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 ring-2 ring-slate-900 ring-offset-2' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => switchMethod(PaymentMethod.STRIPE)}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Card</span>
              </Button>
              <Button
                variant={paymentMethod === PaymentMethod.PAYPAL ? 'default' : 'outline'}
                className={`h-16 rounded-2xl flex flex-col gap-1 transition-all ${
                  paymentMethod === PaymentMethod.PAYPAL 
                    ? 'bg-[#0070ba] text-white shadow-xl shadow-blue-100 ring-2 ring-[#0070ba] ring-offset-2' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => switchMethod(PaymentMethod.PAYPAL)}
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">PayPal</span>
              </Button>
            </div>

            {/* Payment Form Area */}
            <div className="min-h-[200px] relative">
              <AnimatePresence mode="wait">
                {initiatePaymentMutation.isPending ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Securing Session...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {paymentMethod === PaymentMethod.STRIPE && clientSecret ? (
                      <StripeCheckoutForm
                        clientSecret={clientSecret}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    ) : paymentMethod === PaymentMethod.PAYPAL && orderID ? (
                      <PayPalCheckoutButton
                        orderID={orderID}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 text-slate-400 italic text-sm">
                        Initializing {paymentMethod === PaymentMethod.STRIPE ? 'Stripe' : 'PayPal'}...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 text-center leading-relaxed">
             By completing this payment, you agree to our Terms of Service and Escrow Policy. 
             Funds are only released to the provider after you confirm the service is complete.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
