'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserProfile, useUpdateUserProfile } from '@/service/user/hook';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Bell, Gift, Percent, CreditCard, Ticket } from 'lucide-react';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetUserProfile();
  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const handleToggle = async (field: 'giftCard' | 'voucher' | 'promotion' | 'coupons', currentValue: boolean) => {
    if (!profile) return;
    
    // Optimistic toast/update
    try {
      await updateProfile({
        id: profile.id,
        [field]: !currentValue,
      });
      toast.success('Notification preferences updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preference');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const notificationItems = [
    {
      key: 'giftCard' as const,
      title: 'Gift Card Notifications',
      description: 'Receive updates when you receive a new gift card or balance is low.',
      icon: CreditCard,
      value: !!profile?.giftCard,
    },
    {
      key: 'voucher' as const,
      title: 'Voucher Redemptions',
      description: 'Get notified when vouchers are active, sold, or successfully redeemed.',
      icon: Ticket,
      value: !!profile?.voucher,
    },
    {
      key: 'promotion' as const,
      title: 'Marketing Promotions',
      description: 'Receive emails about ongoing campaign events, boroughs, and high street rotators.',
      icon: Gift,
      value: !!profile?.promotion,
    },
    {
      key: 'coupons' as const,
      title: 'Coupon Updates',
      description: 'Get alerts when customers link, save, or redeem coupons at checkout.',
      icon: Percent,
      value: !!profile?.coupons,
    },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Preferences & Triggers</h1>
            <p className="text-xs text-gray-500">Configure email triggers and alert channels.</p>
          </div>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Email Preferences</CardTitle>
              <CardDescription>Select which notifications you want to receive.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
          {notificationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 flex items-center justify-center mt-0.5 shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-sm">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* iOS Style Switch Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.key, item.value)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:ring-offset-2 ${
                    item.value ? 'bg-[#ff6900]' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                  role="switch"
                  aria-checked={item.value}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      item.value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
