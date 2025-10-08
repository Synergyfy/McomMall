"use client";

import { useGetGroupById, useInitiateContributionPayment } from '@/service/grouping/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Wallet, CheckCircle, Hourglass, AlertTriangle } from 'lucide-react';
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
  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
    <div className="flex items-center">
      <Users className="h-5 w-5 mr-3 text-muted-foreground" />
      <span className="font-medium">{member.user.name}</span>
    </div>
    <Badge variant={member.status === 'ACTIVE' ? 'default' : 'outline'}>
      {member.status === 'ACTIVE' ? (
        <CheckCircle className="h-4 w-4 mr-1" />
      ) : (
        <Hourglass className="h-4 w-4 mr-1" />
      )}
      {member.status.replace('_', ' ')}
    </Badge>
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

  if (isLoading) return <div>Loading group details...</div>;
  if (error) return (
    <div className="container mx-auto p-4 md:p-8 text-center">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-red-500">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load group details: {error.message}</p>
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
           <Button variant="outline" className="w-full mt-2" onClick={resetPaymentState}>
            Cancel
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
      <div className="flex flex-col items-stretch gap-3">
        <Button
          onClick={() => handleInitiatePayment(PaymentMethod.STRIPE)}
          disabled={initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.STRIPE}
          size="lg"
        >
          {initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.STRIPE
            ? 'Processing...'
            : 'Pay £250 with Stripe'}
        </Button>
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
        <Button
          onClick={() => handleInitiatePayment(PaymentMethod.PAYPAL)}
           disabled={initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.PAYPAL}
          size="lg"
        >
          {initiatePayment.isPending && selectedPaymentProvider === PaymentMethod.PAYPAL
            ? 'Processing...'
            : 'Pay £250 with Paypal'}
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">{group.name}</CardTitle>
            <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {group.status}
            </Badge>
          </div>
          <CardDescription>{group.localArea}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Group Wallet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center text-4xl font-bold text-primary">
                  <Wallet className="h-10 w-10 mr-4" />
                  <span>£{Number(group.wallet.balance).toFixed(2)}</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Total contributions from members.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Status</CardTitle>
                <CardDescription>
                  Deadline: {new Date(group.recruitmentDeadline).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Members</span>
                  <span className="text-sm font-semibold">
                    {group.members.length} / {group.size}
                  </span>
                </div>
                <Progress value={fundingProgress} />
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Members</h2>
            <div className="space-y-3">
              {group.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>

          {canPay && (
            <div className="pt-6 border-t">
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="text-center">
                  <CardTitle>Complete Your Contribution</CardTitle>
                  <CardDescription>
                    Pay your £250 contribution to become an active member of this group.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {renderPaymentArea()}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDetailsClient;