'use client';

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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-center">
      <p className="text-lg font-semibold">Processing payment...</p>
      <p>Please do not close this page.</p>
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
      const totalAddonPrice = selectedAddons.reduce((acc, addonId) => {
        const addon = service.configurableAddons.find(a => a.id === addonId);
        return acc + (addon ? addon.price : 0);
      }, 0);
      const totalAmount = parseFloat(service.fixedPrice) + totalAddonPrice;

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
        return `£${service.pricePerHour}/hour`;
      case 'PER_UNIT':
        return `£${service.pricePerUnit}/${service.unitName}`;
      default:
        return 'Price not available';
    }
  };

  if (!service) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={resetState}>
        <DialogContent className="sm:max-w-[600px] relative">
          {verifyPayment.isPending && <LoadingOverlay />}
          <DialogHeader>
            <DialogTitle>
              {step === 'booking' ? `Book ${service.name}` : 'Complete Payment'}
            </DialogTitle>
            <DialogDescription>{service.description}</DialogDescription>
          </DialogHeader>

          {step === 'booking' ? (
            <>
              <div className="grid gap-4 py-4">
                <p>Price: {getPriceDisplay(service)}</p>
                {service.configurableAddons.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Add-ons</h4>
                    {service.configurableAddons.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={addon.id}
                          onCheckedChange={() => handleAddonToggle(addon.id)}
                        />
                        <label htmlFor={addon.id}>
                          {addon.name} (+£{addon.price})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                  <div className="grid gap-4">
                    <Select onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001]">
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="11:00">11:00</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="13:00">13:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="15:00">15:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="17:00">17:00</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select onValueChange={setEndTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001]">
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="11:00">11:00</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="13:00">13:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="15:00">15:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="17:00">17:00</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={paymentProvider === 'stripe' ? 'default' : 'outline'}
                    onClick={() => setPaymentProvider('stripe')}
                  >
                    Pay with Stripe
                  </Button>
                  <Button
                    variant={paymentProvider === 'paypal' ? 'default' : 'outline'}
                    onClick={() => setPaymentProvider('paypal')}
                  >
                    Pay with PayPal
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                onClick={handleSubmit}
                disabled={createBooking.isPending || initiatePayment.isPending}
              >
                {createBooking.isPending || initiatePayment.isPending
                  ? 'Submitting...'
                  : 'Submit Booking'}
              </Button>
            </>
          ) : (
            <div className="py-4">
              {paymentProvider === 'stripe' && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
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
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                    />
                  </PayPalScriptProvider>
                </ClientProviders>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <SuccessAnimationDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
      />
    </>
  );
}
