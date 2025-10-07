"use client";

import { useState } from "react";
import { useGetMyMembership, useInitiateMembershipPayment } from "@/service/membership/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { MembershipTier } from "@/service/membership/types";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import MembershipCheckoutForm from "./MembershipCheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const tiers = [
  {
    name: "BASIC",
    price: "Free",
    features: ["Basic analytics", "Standard support"],
    isFree: true,
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
  const initiatePayment = useInitiateMembershipPayment();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleUpgrade = (tier: MembershipTier) => {
    if (tier === "BASIC") {
      toast.info("Basic plan is free and assigned by default.");
      return;
    }
    setSelectedTier(tier);
    initiatePayment.mutate({ tier }, {
      onSuccess: (data) => {
        setClientSecret(data.clientSecret);
      },
      onError: (error) => {
        toast.error(`Failed to initiate payment: ${error.message}`);
        setSelectedTier(null);
      }
    });
  };

  const handleSuccess = () => {
    setClientSecret(null);
    setSelectedTier(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (clientSecret && selectedTier) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <CardDescription>
              You are upgrading to the <span className="font-semibold text-primary">{selectedTier}</span> plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <MembershipCheckoutForm tier={selectedTier} onSuccess={handleSuccess} />
            </Elements>
          </CardContent>
           <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => { setClientSecret(null); setSelectedTier(null); }}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
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
                disabled={initiatePayment.isPending && selectedTier === tier.name || membership?.tier === tier.name}
                className="w-full"
              >
                {initiatePayment.isPending && selectedTier === tier.name ? "Loading..." : membership?.tier === tier.name ? "Current Plan" : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MembershipClient;