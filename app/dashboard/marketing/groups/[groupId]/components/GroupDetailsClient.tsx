"use client";

import { useGetGroupById, useInitiateContributionPayment } from '@/service/grouping/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Wallet, CheckCircle, Hourglass, AlertTriangle, MapPin, CalendarDays, ArrowLeft, Landmark, CreditCard } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { GroupMember } from '@/service/grouping/types';
import { RootState } from '@/service/store/store';
import { useState } from 'react';
import { PaymentMethod } from '@/service/membership/types';
import { Separator } from '@/components/ui/separator';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import ContributionStripeCheckout from './ContributionStripeCheckout';
import ContributionPaypalCheckout from './ContributionPaypalCheckout';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';


interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const MemberCard = ({ member }: { member: GroupMember }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800/50">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
        <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <span className="font-semibold text-gray-800 dark:text-gray-100">{member.user.name}</span>
    </div>
    <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
      {member.status === 'ACTIVE' ? (
        <CheckCircle className="h-4 w-4 mr-1.5" />
      ) : (
        <Hourglass className="h-4 w-4 mr-1.5" />
      )}
      {member.status.replace('_', ' ')}
    </Badge>
  </div>
);

const GroupDetailsSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
    </div>
);


const GroupDetailsClient = ({ groupId }: { groupId: string }) => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data: group, isLoading, error } = useGetGroupById(groupId);
  const initiatePayment = useInitiateContributionPayment();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [
    selectedPaymentProvider,
    setSelectedPaymentProvider,
  ] = useState<PaymentMethod | null>(null);

  const handleInitiatePayment = (provider: PaymentMethod) => {
    setSelectedPaymentProvider(provider);
    initiatePayment.mutate(
      { groupId, dto: { paymentProvider: provider } },
      {
        onSuccess: (data) => {
          if (data.provider === PaymentMethod.STRIPE && data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else if (data.provider === PaymentMethod.PAYPAL && data.orderId) {
            setOrderId(data.orderId);
          } else {
            toast.error('Invalid response from payment provider.');
            resetPaymentState();
          }
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred.';
          toast.error(`Failed to initiate payment: ${errorMessage}`);
          resetPaymentState();
        },
      }
    );
  };

  const resetPaymentState = () => {
    setClientSecret(null);
    setOrderId(null);
    setSelectedPaymentProvider(null);
  };

  if (isLoading) return (
    <div className="container mx-auto p-4 md:p-8">
        <GroupDetailsSkeleton />
    </div>
  );
  if (error) return (
    <div className="container mx-auto p-4 md:p-8 text-center">
      <Card className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-800 dark:text-red-200">Could not load group details: {error.message}</p>
        </CardContent>
      </Card>
    </div>
  );
  if (!group || !group.members || !group.wallet) return <div>Group data is incomplete or not found.</div>;

  const currentUserMemberInfo = group.members.find(
    (m) => m.user.id === userId
  );

  const canPay = currentUserMemberInfo?.status === 'PENDING_PAYMENT';
  const fundingProgress = (group.members.length / group.size) * 100;

  const renderPaymentArea = () => {
    if (clientSecret && selectedPaymentProvider === PaymentMethod.STRIPE) {
      return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <ContributionStripeCheckout
            groupId={groupId}
            onSuccess={resetPaymentState}
          />
           <Button variant="ghost" className="w-full mt-2 text-gray-500" onClick={resetPaymentState}>
            Cancel Payment
          </Button>
        </Elements>
      );
    }

    if (orderId && selectedPaymentProvider === PaymentMethod.PAYPAL) {
      return (
        <ContributionPaypalCheckout
          groupId={groupId}
          orderId={orderId}
          onSuccess={resetPaymentState}
          onCancel={resetPaymentState}
        />
      );
    }

    return (
      <div className="flex flex-col items-stretch gap-4">
        <Button
          onClick={() => handleInitiatePayment(PaymentMethod.STRIPE)}
          disabled={initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.STRIPE}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.STRIPE
            ? 'Processing...'
            : 'Pay with Card'}
        </Button>
        <Button
          onClick={() => handleInitiatePayment(PaymentMethod.PAYPAL)}
           disabled={initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.PAYPAL}
          size="lg"
          className="bg-[#0070BA] hover:bg-[#005ea6] text-white"
        >
          <Landmark className="mr-2 h-5 w-5" />
          {initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.PAYPAL
            ? 'Processing...'
            : 'Pay with Paypal'}
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto p-4 md:p-8">
            <Link href="/dashboard/marketing/groups" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Groups
            </Link>

            <header className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">{group.name}</h1>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {group.localArea}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Wallet Balance</CardTitle>
                        <Wallet className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 dark:text-gray-50">£{Number(group.wallet.balance).toFixed(2)}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">From all active members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Members</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 dark:text-gray-50">{group.members.length} / {group.size}</div>
                        <Progress value={fundingProgress} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Recruitment</CardTitle>
                        <CalendarDays className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-50">{new Date(group.recruitmentDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Recruitment Deadline</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Group Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {group.members.map((member) => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    {canPay && (
                        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold">Complete Your Contribution</CardTitle>
                                <CardDescription className="text-blue-100 mt-2">
                                    Pay your £250 contribution to become an active member of this group.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                {renderPaymentArea()}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default GroupDetailsClient;