'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey && process.env.NODE_ENV !== 'production') {
    console.warn('Stripe publishable key is missing! Checkout will not work.');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripeProviderProps {
    children: React.ReactNode;
    clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
    if (!stripePromise) {
        return <>{children}</>;
    }

    // If clientSecret is provided, we must use it in options
    const options = clientSecret ? { clientSecret } : undefined;

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
