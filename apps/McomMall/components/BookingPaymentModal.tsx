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
import { CreditCard, Wallet, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { useInitiatePayment, useVerifyPayment } from '@/service/bookings/hook';
import { PaymentMethod } from '@/service/bookings/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingSuccessModal } from './BookingSuccessModal';

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
  const [showSuccess, setShowSuccess] = useState(false);

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
      setShowSuccess(true);
      // We don't call onSuccess() yet, we wait for the modal
    } catch (error) {
      console.error('Failed to verify payment', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (showSuccess) {
    return (
      <BookingSuccessModal
        isOpen={true}
        onClose={() => {
            setShowSuccess(false);
            onSuccess();
            onClose();
        }}
        bookingId={bookingId}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] w-[95vw] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Service Booking Payment</DialogTitle>
          <DialogDescription>
            Complete your booking by choosing a payment method.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="relative">
                <AnimatePresence>
                {isVerifying && (
                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
                    >
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-orange-600 mb-6" />
                        <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg"
                        >
                        <ShieldCheck className="h-6 w-6 text-white" />
                        </motion.div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Verifying Payment</h3>
                    <p className="text-slate-600 font-bold mb-8">Please do not close this window or refresh the page.</p>
                    
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4 text-left max-w-sm">
                        <AlertCircle className="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-800 font-medium leading-relaxed">
                        We are securely confirming your transaction with the payment provider. This usually takes just a few seconds.
                        </p>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="p-8">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Complete Payment</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium text-base">
                    Your funds will be held in escrow until the service is completed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                    {/* Amount Summary */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total to Pay</span>
                    <span className="text-3xl font-black text-orange-600">
                        {new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency: 'GBP',
                        }).format(amount)}
                    </span>
                    </div>

                    {/* Method Selection */}
                    <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant={paymentMethod === PaymentMethod.STRIPE ? 'default' : 'outline'}
                        className={`h-20 rounded-2xl flex flex-col gap-2 transition-all border-2 ${
                        paymentMethod === PaymentMethod.STRIPE 
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 border-slate-900' 
                            : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                        onClick={() => switchMethod(PaymentMethod.STRIPE)}
                    >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-xs font-black uppercase tracking-widest">Credit Card</span>
                    </Button>
                    <Button
                        variant={paymentMethod === PaymentMethod.PAYPAL ? 'default' : 'outline'}
                        className={`h-20 rounded-2xl flex flex-col gap-2 transition-all border-2 ${
                        paymentMethod === PaymentMethod.PAYPAL 
                            ? 'bg-[#0070ba] text-white shadow-xl shadow-blue-100 border-[#0070ba]' 
                            : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                        onClick={() => switchMethod(PaymentMethod.PAYPAL)}
                    >
                        <Wallet className="h-6 w-6" />
                        <span className="text-xs font-black uppercase tracking-widest">PayPal</span>
                    </Button>
                    </div>

                    {/* Payment Form Area */}
                    <div className="min-h-[250px] relative bg-slate-50/30 rounded-3xl p-1">
                    <AnimatePresence mode="wait">
                        {initiatePaymentMutation.isPending ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"
                        >
                            <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Securing Session</p>
                        </motion.div>
                        ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            {paymentMethod === PaymentMethod.STRIPE && clientSecret ? (
                            <div className="p-2">
                                <StripeCheckoutForm
                                    clientSecret={clientSecret}
                                    onPaymentSuccess={handlePaymentSuccess}
                                />
                            </div>
                            ) : paymentMethod === PaymentMethod.PAYPAL && orderID ? (
                            <div className="p-4">
                                <PayPalCheckoutButton
                                    orderID={orderID}
                                    onPaymentSuccess={handlePaymentSuccess}
                                />
                            </div>
                            ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                                <Loader2 className="h-6 w-6 animate-spin opacity-20" />
                                <span className="text-sm font-bold italic">Initializing {paymentMethod === PaymentMethod.STRIPE ? 'Stripe' : 'PayPal'}...</span>
                            </div>
                            )}
                        </motion.div>
                        )}
                    </AnimatePresence>
                    </div>
                </div>
                </div>
            </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
           <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium max-w-sm mx-auto">
             By completing this payment, you agree to our <span className="text-slate-600 font-bold">Terms of Service</span> and <span className="text-slate-600 font-bold">Escrow Policy</span>. 
             Funds are only released to the provider after you confirm the service is complete.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
