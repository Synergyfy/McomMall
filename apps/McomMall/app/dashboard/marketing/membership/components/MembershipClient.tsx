"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import {
  useGetMyMembership,
  useInitiateMembershipPayment,
  useVerifyMembershipPayment,
} from '@/service/membership/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Star, Wallet } from 'lucide-react';
import { Membership } from '@/service/membership/types';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import MembershipCheckoutForm from './MembershipCheckoutForm';
import MembershipSuccessDialog from './MembershipSuccessDialog';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const stripePromise = loadStripe(
  (process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
);

const tiers = [
  {
    name: 'BASIC',
    price: 'Free',
    features: ['Basic analytics', 'Standard support'],
    isFree: true,
  },
  {
    name: 'EXTENDED',
    price: '£50/month',
    features: [
      'Advanced analytics',
      'Priority support',
      'Early access to new features',
    ],
  },
  {
    name: 'PROFESSIONAL',
    price: '£100/month',
    features: [
      'All Extended features',
      'Dedicated account manager',
    ],
    highlight: true,
  },
];

const MembershipClient = () => {
  const { userRole } = useSelector((state: RootState) => state.auth);
  const isCustomer = userRole === 'customer';
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const { data: membership, isLoading, error } = useGetMyMembership();
  const initiatePayment = useInitiateMembershipPayment();
  const verifyPayment = useVerifyMembershipPayment();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [
    successfulMembership,
    setSuccessfulMembership,
  ] = useState<Membership | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const newIdempotencyKey = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `membership-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const handleUpgrade = (tier: string) => {
    if (tier === 'BASIC') {
      toast.info('Basic plan is free and assigned by default.');
      return;
    }
    setSelectedTier(tier);
    initiatePayment.mutate(
      {
        tier: tier.toLowerCase() as 'basic' | 'extended' | 'professional',
        paymentProvider: 'stripe',
        planType: 'monthly',
        idempotencyKey: newIdempotencyKey(),
        returnUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        cancelUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret ?? null);
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred.';
          toast.error(`Failed to initiate payment: ${errorMessage}`);
          setSelectedTier(null);
        },
      }
    );
  };

  const handleWalletUpgrade = (tier: string) => {
    if (tier === 'BASIC') {
      toast.info('Basic plan is free and assigned by default.');
      return;
    }
    setSelectedTier(tier);
    initiatePayment.mutate(
      {
        tier: tier.toLowerCase() as 'basic' | 'extended' | 'professional',
        paymentProvider: 'mcom_wallet',
        planType: 'monthly',
        idempotencyKey: newIdempotencyKey(),
      },
      {
        onSuccess: (data) => {
          const transactionId = data.transactionId || data.holdId;
          if (!transactionId) {
            toast.error('MCOM Wallet did not return a payment reference.');
            setSelectedTier(null);
            return;
          }
          verifyPayment.mutate(
            {
              paymentProvider: 'mcom_wallet',
              transactionId,
              holdId: transactionId,
              purchaseDetails: {
                tier: tier.toLowerCase() as
                  | 'basic'
                  | 'extended'
                  | 'professional',
                planType: 'monthly',
              },
            },
            {
              onSuccess: (newMembership) => {
                setSelectedTier(null);
                handlePaymentSuccess(newMembership);
              },
              onError: (err: ApiError) => {
                toast.error(
                  err.response?.data?.message ||
                    err.message ||
                    'Wallet payment verification failed.',
                );
                setSelectedTier(null);
              },
            },
          );
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred.';
          toast.error(`Failed to initiate payment: ${errorMessage}`);
          setSelectedTier(null);
        },
      },
    );
  };

  const resetSelection = () => {
    setClientSecret(null);
    setSelectedTier(null);
  };

  const handlePaymentSuccess = (newMembership: Membership) => {
    resetSelection();
    setSuccessfulMembership(newMembership);
    setIsSuccessDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsSuccessDialogOpen(false);
    setSuccessfulMembership(null);
  };

  if (!isMounted || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (clientSecret && selectedTier) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <CardDescription>
              You are upgrading to the{' '}
              <span className="font-semibold text-primary">{selectedTier}</span>{' '}
              plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <MembershipCheckoutForm
                tier={selectedTier}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSelection}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <MembershipSuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={handleDialogClose}
        membership={successfulMembership}
      />
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-4">Membership</h1>
        <p className="text-muted-foreground mb-8">
          Manage your membership plan and unlock new features.
        </p>

        {membership && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Current Plan</CardTitle>
              <CardDescription>
                You are currently on the{' '}
                <span className="font-semibold text-primary">
                  {membership.tier?.name ?? 'Active plan'}
                </span>{' '}
                plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Your membership is {membership.isActive ? 'active' : (membership.status || 'inactive')}{' '}
                and expires on{' '}
                {new Date(membership.expiresAt || membership.endDate || Date.now()).toLocaleDateString()}.
              </p>
            </CardContent>
          </Card>
        )}

        {isCustomer && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-orange-900">
                Membership plans are for business accounts only. Customer
                accounts can shop, book services, and use their MCOM Wallet
                without a paid membership.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlight ? 'border-primary' : ''}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tier.name}
                  {tier.highlight && <Star className="text-primary" />}
                </CardTitle>
                <CardDescription>{tier.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              {!isCustomer && (
              <CardFooter className="flex flex-col gap-2">
                <Button
                  onClick={() => handleUpgrade(tier.name)}
                  disabled={
                    (initiatePayment.isPending && selectedTier === tier.name) ||
                    membership?.tier?.name === tier.name
                  }
                  className="w-full"
                >
                  {initiatePayment.isPending && selectedTier === tier.name
                    ? 'Loading...'
                    : membership?.tier?.name === tier.name
                    ? 'Current Plan'
                    : 'Upgrade'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleWalletUpgrade(tier.name)}
                  disabled={
                    (initiatePayment.isPending || verifyPayment.isPending) &&
                    selectedTier === tier.name
                  }
                  className="w-full"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Pay with MCOM Wallet
                </Button>
              </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default MembershipClient;