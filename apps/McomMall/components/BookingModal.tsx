'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Service } from '@/service/services/types';
import {
  useCreateBooking,
  useInitiatePayment,
  useVerifyPayment,
} from '@/service/bookings/hook';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';
import { SuccessAnimationDialog } from './SuccessAnimationDialog';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ClientProviders } from './client-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  ChevronRight, 
  Info,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { CURRENCY } from '@/lib/utils';
import { format } from 'date-fns';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[60] rounded-[2rem]">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-[#f58220] border-t-transparent rounded-full animate-spin mx-auto" />
      <div className="space-y-1">
        <p className="text-lg font-black text-gray-900 uppercase tracking-widest text-xs">Processing Payment</p>
        <p className="text-gray-500 text-sm font-bold">Please don't refresh the page</p>
      </div>
    </div>
  </div>
);

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({
  service,
  isOpen,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState<'booking' | 'payment'>('booking');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal' | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const initiatePayment = useInitiatePayment();
  const verifyPayment = useVerifyPayment({
    onSuccess: () => {
      resetState();
      setShowSuccessDialog(true);
    },
  });

  const createBooking = useCreateBooking({
    onSuccess: (data) => {
      if (paymentProvider) {
        setBookingId(data.id);
        initiatePayment.mutate({
          bookingId: data.id,
          paymentProvider,
        });
      }
    },
  });

  useEffect(() => {
    if (initiatePayment.data) {
      if (initiatePayment.data.provider === 'stripe') {
        setClientSecret(initiatePayment.data.clientSecret);
      } else {
        setOrderId(initiatePayment.data.orderId);
      }
      setStep('payment');
    }
  }, [initiatePayment.data]);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const resetState = () => {
    setStep('booking');
    setPaymentProvider(null);
    setBookingId(null);
    setClientSecret(null);
    setOrderId(null);
    setDate(new Date());
    setStartTime('');
    setEndTime('');
    setSelectedAddons([]);
    onClose();
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleSubmit = () => {
    if (!service || !date || !startTime || !endTime || !paymentProvider) {
      toast.error('Please fill all fields and select a payment method');
      return;
    }

    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    createBooking.mutate({
      serviceId: service.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
  };

  const handlePaymentSuccess = (transactionId: string) => {
    if (bookingId && service && paymentProvider) {
      const totalAddonPrice = service.configurableAddons ? selectedAddons.reduce((acc, addonId) => {
        const addon = service.configurableAddons.find(a => a.id === addonId);
        return acc + (addon ? parseFloat(addon.price) : 0);
      }, 0) : 0;
       const totalAmount = parseFloat(service.fixedPrice || '0') + totalAddonPrice;

      verifyPayment.mutate({
        bookingId,
        amount: totalAmount,
        paymentProvider,
        transactionId,
      });
    }
  };


  const getPriceDisplay = (service: Service) => {
    switch (service.pricingModel.toUpperCase()) {
      case 'FIXED':
        return `£${service.fixedPrice}`;
      case 'HOURLY':
        return `£${service.pricePerHour}/hr`;
      case 'PER_UNIT':
        return `£${service.pricePerUnit}/${service.unitName}`;
      default:
        return 'Quote Only';
    }
  };

  const timeOptions = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  return (
    <>
      <SuccessAnimationDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
      />

      {service && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
          <DialogContent className="sm:max-w-[700px] p-0 border-none bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
            {verifyPayment.isPending && <LoadingOverlay />}
            
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Left Sidebar - Summary */}
              <div className="md:w-64 bg-slate-900 p-8 text-white flex flex-col justify-between shrink-0">
                <div>
                    <span className="text-[10px] font-black text-[#f58220] uppercase tracking-widest mb-4 block">Booking Summary</span>
                    <h2 className="text-2xl font-black mb-2 tracking-tight leading-tight">{service.name}</h2>
                    <p className="text-white/40 text-xs font-bold line-clamp-3 mb-8">{service.description}</p>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#f58220]">
                            <CalendarIcon size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Date</p>
                            <p className="text-sm font-black">{date ? format(date, 'MMM d, yyyy') : 'Not selected'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#f58220]">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Time Slot</p>
                            <p className="text-sm font-black">{startTime && endTime ? `${startTime} - ${endTime}` : 'Pick times'}</p>
                        </div>
                      </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 mt-8">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Base Price</p>
                    <p className="text-3xl font-black text-[#f58220]">{getPriceDisplay(service)}</p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 overflow-y-auto hide-scrollbar">
                <AnimatePresence mode="wait">
                  {step === 'booking' ? (
                    <motion.div
                      key="booking-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                          <CalendarIcon size={20} className="text-[#f58220]" /> Select Appointment
                        </h3>
                        <div className="flex flex-col xl:flex-row gap-6 items-start">
                          <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 mx-auto">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="rounded-xl border-none"
                            />
                          </div>
                          <div className="space-y-4 w-full">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Time</label>
                              <Select value={startTime} onValueChange={setStartTime}>
                                  <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl font-bold">
                                    <SelectValue placeholder="Pick start" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[1100]">
                                    {timeOptions.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Time</label>
                              <Select value={endTime} onValueChange={setEndTime}>
                                  <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl font-bold">
                                    <SelectValue placeholder="Pick end" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[1100]">
                                    {timeOptions.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {service.configurableAddons && service.configurableAddons.length > 0 && (
                        <div>
                          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-[#f58220]" /> Enhance Service
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            {service.configurableAddons.map((addon) => (
                              <div
                                key={addon.id}
                                onClick={() => handleAddonToggle(addon.id)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                  selectedAddons.includes(addon.id) 
                                    ? 'border-[#f58220] bg-orange-50' 
                                    : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                    selectedAddons.includes(addon.id) ? 'bg-[#f58220] text-white' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {selectedAddons.includes(addon.id) && <CheckCircle2 size={14} />}
                                  </div>
                                  <span className={`font-bold text-sm ${selectedAddons.includes(addon.id) ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {addon.name}
                                  </span>
                                </div>
                                <span className="font-black text-[#f58220] text-sm">+£{addon.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard size={20} className="text-[#f58220]" /> Payment Method
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setPaymentProvider('stripe')}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                              paymentProvider === 'stripe' ? 'border-[#f58220] bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentProvider === 'stripe' ? 'bg-[#f58220] text-white' : 'bg-gray-100 text-gray-400'}`}>
                              <CreditCard size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Stripe</span>
                          </button>
                          <button
                            onClick={() => setPaymentProvider('paypal')}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                              paymentProvider === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentProvider === 'paypal' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              <p className="font-black italic text-sm">PP</p>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">PayPal</span>
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={createBooking.isPending || initiatePayment.isPending}
                        className="w-full h-16 bg-[#f58220] hover:bg-[#e67a1d] text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20 group"
                      >
                        {createBooking.isPending || initiatePayment.isPending
                          ? 'Confirming Slot...'
                          : (
                            <span className="flex items-center gap-2">
                              Secure Appointment <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                          )
                        }
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="payment-step"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col justify-center items-center py-12 text-center"
                    >
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
                        <ShieldCheck size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">Finalize Your Payment</h3>
                      <p className="text-gray-500 font-bold text-sm mb-10 max-w-xs">Your slot is reserved! Complete the payment below to confirm your booking.</p>
                      
                      <div className="w-full max-w-md p-6 bg-white rounded-[2rem] border border-gray-100 shadow-xl">
                        {paymentProvider === 'stripe' && clientSecret && (
                          <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripeCheckoutForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
                          </Elements>
                        )}
                        {paymentProvider === 'paypal' && orderId && (
                          <ClientProviders>
                            <PayPalScriptProvider
                              options={{
                                clientId:
                                  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                              }}
                            >
                              <PayPalCheckoutButton
                                orderID={orderId}
                                onPaymentSuccess={handlePaymentSuccess}
                              />
                            </PayPalScriptProvider>
                          </ClientProviders>
                        )}
                      </div>

                      <button 
                        onClick={() => setStep('booking')}
                        className="mt-8 text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                      >
                        Changed your mind? Go Back
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}