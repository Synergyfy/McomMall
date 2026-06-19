'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Puzzle, Key, RefreshCw } from 'lucide-react';

export default function AppsIntegrationsPage() {
  const router = useRouter();

  // Load initial settings from localStorage to act as product-ready simulation
  const [googleConnected, setGoogleConnected] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [bookingsConnected, setBookingsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGoogleConnected(localStorage.getItem('integration_google') === 'true');
      setStripeConnected(localStorage.getItem('integration_stripe') === 'true');
      setBookingsConnected(localStorage.getItem('integration_bookings') === 'true');
    }
  }, []);

  const handleToggle = (appKey: 'google' | 'stripe' | 'bookings', currentVal: boolean) => {
    const newVal = !currentVal;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`integration_${appKey}`, newVal ? 'true' : 'false');
    }

    if (appKey === 'google') setGoogleConnected(newVal);
    if (appKey === 'stripe') setStripeConnected(newVal);
    if (appKey === 'bookings') setBookingsConnected(newVal);

    if (newVal) {
      toast.success(`Successfully connected to ${appKey.toUpperCase()}!`);
    } else {
      toast.info(`Disconnected from ${appKey.toUpperCase()}.`);
    }
  };

  const integrations = [
    {
      key: 'google' as const,
      name: 'Google Business Profile',
      description: 'Synchronize your public physical store details, customer reviews, and physical business coordinates automatically.',
      connected: googleConnected,
      icon: Globe,
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      key: 'stripe' as const,
      name: 'Stripe Payments',
      description: 'Receive payments, deposits, and process checkout transactions directly into your bank account securely.',
      connected: stripeConnected,
      icon: Key,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      key: 'bookings' as const,
      name: 'Calendar & Bookings Sync',
      description: 'Sync customer appointments, reservation schedules, and availability windows with Outlook or Google Calendar.',
      connected: bookingsConnected,
      icon: RefreshCw,
      color: 'bg-green-50 text-green-600 border-green-100',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings')}
            className="rounded-full hover:bg-orange-50 text-[#ff6900]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Integrations Center</h1>
            <p className="text-xs text-gray-500">Connect third-party apps and checkout controllers.</p>
          </div>
        </div>
      </div>

      {/* Main Apps List */}
      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center">
              <Puzzle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Third-Party Connections</CardTitle>
              <CardDescription>Activate plugins to sync coordinates, payments, and booking widgets.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
          {integrations.map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.key} className="flex flex-col sm:flex-row sm:items-center justify-between py-5 first:pt-0 last:pb-0 gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${app.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {app.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                      {app.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.connected 
                          ? 'bg-green-50 text-[#22C55E]' 
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                      }`}>
                        {app.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(app.key, app.connected)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ff6900] ${
                      app.connected ? 'bg-[#ff6900]' : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        app.connected ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
