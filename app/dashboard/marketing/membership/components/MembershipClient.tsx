"use client";

import { useEffect, useState } from "react";
import { useGetMyMembership, useInitiatePayment } from "@/service/membership/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { LowercaseMembershipTier, MembershipTier } from "@/service/membership/types";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import MembershipPayment from "./MembershipPayment";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// It's safe to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(stripePublishableKey);

const tiers = [
  {
    name: "BASIC",
    price: "Free",
    features: ["Basic analytics", "Standard support"],
  },
  {
    name: "EXTENDED",
    price: "£10/month",
    features: ["Advanced analytics", "Priority support", "Early access to new features"],
  },
  {
    name: "PROFESSIONAL",
    price: "£25/month",
    features: ["All Extended features", "Group creation", "Dedicated account manager"],
    highlight: true,
  },
];

const MembershipClient = () => {
  const { data: membership, isLoading, error } = useGetMyMembership();
  const initiatePayment = useInitiatePayment();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const isStripeConfigured = !!stripePublishableKey;

  useEffect(() => {
    if (!isStripeConfigured) {
      toast.error("Payment system is not configured. Please contact support.");
    }
  }, [isStripeConfigured]);

  const handleUpgrade = (tier: MembershipTier) => {
    if (!isStripeConfigured) {
      return;
    }
    setSelectedTier(tier);
    initiatePayment.mutate({ tier: tier.toLowerCase() as LowercaseMembershipTier }, {
      onSuccess: (data) => {
        setClientSecret(data.clientSecret);
      },
      onError: (error) => {
        toast.error(`Failed to initiate payment: ${error.message}`);
        setSelectedTier(null);
      }
    });
  };

  const handlePaymentSuccess = () => {
    setClientSecret(null);
    setSelectedTier(null);
    // Membership data will be refetched automatically by react-query's invalidation
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Elements stripe={stripePromise}>
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
                You are currently on the{" "}
                <span className="font-semibold text-primary">{membership.tier}</span> plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Your membership is {membership.isActive ? "active" : "inactive"} and
                expires on {new Date(membership.expiresAt).toLocaleDateString()}.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedTier && clientSecret ? (
          <Card>
            <CardHeader>
              <CardTitle>Upgrade to {selectedTier}</CardTitle>
              <CardDescription>
                Complete your payment to upgrade your membership.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MembershipPayment
                clientSecret={clientSecret}
                tier={selectedTier}
                onSuccess={handlePaymentSuccess}
              />
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => {
                setSelectedTier(null);
                setClientSecret(null);
              }}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card key={tier.name} className={tier.highlight ? "border-primary" : ""}>
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
                <CardFooter>
                  <Button
                    onClick={() => handleUpgrade(tier.name as MembershipTier)}
                    disabled={!isStripeConfigured || initiatePayment.isPending || membership?.tier === tier.name}
                    className="w-full"
                  >
                    {membership?.tier === tier.name ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Elements>
  );
};

export default MembershipClient;