'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoucherTabContent from '@/app/(public)/listings/[id]/components/VoucherTabContent';
import { InHouseBusiness } from '@/service/listings/types';
import LoyaltyContent from '@/components/LoyaltyContent';
import GiftCardTabContent from '@/app/(public)/listings/[id]/components/GiftCardTabContent';
import CouponTabContent from '@/app/(public)/listings/[id]/components/CouponTabContent';
import { useState } from 'react';
import { Ticket, Gift, Sparkles, Award } from 'lucide-react';

interface PromotionsSectionProps {
  listing: InHouseBusiness;
}

export default function PromotionsSection({ listing }: PromotionsSectionProps) {
  const { giftCard, voucher, promotion } = listing;
  const [activeTab, setActiveTab] = useState('');

    const availableTabs = [

      { value: 'gift-card', label: 'Gift Cards', icon: Gift, enabled: giftCard },

      {

        value: 'loyalty',

        label: 'Loyalty & Rewards',

        icon: Award,

        enabled: true, // Always show loyalty tab to make it discoverable

      },

      { value: 'voucher', label: 'Vouchers', icon: Ticket, enabled: voucher },

      { value: 'coupon', label: 'Coupons', icon: Sparkles, enabled: true },

    ].filter((tab) => tab.enabled);

  

    if (availableTabs.length === 0) {

      return null;

    }

  

    const defaultTab = availableTabs[0].value;

  

    return (

      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">

        <Tabs

          defaultValue={defaultTab}

          className="w-full"

        >

          <div className="flex flex-col lg:flex-row gap-12">

            {/* Custom Side Tabs on Desktop */}

            <div className="lg:w-72 flex-shrink-0">

               <TabsList className="flex flex-row lg:flex-col w-full h-auto bg-transparent p-0 gap-2 overflow-x-auto hide-scrollbar">

                {availableTabs.map((tab) => {

                  const Icon = tab.icon;

                  return (

                    <TabsTrigger

                      key={tab.value}

                      value={tab.value}

                      className="flex-1 lg:w-full justify-start items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all 

                                 data-[state=active]:bg-orange-50 data-[state=active]:text-[#f58220] data-[state=active]:shadow-none

                                 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-none whitespace-nowrap"

                    >

                      <Icon size={18} />

                      {tab.label}

                    </TabsTrigger>

                  );

                })}

              </TabsList>

  

              <div className="mt-8 hidden lg:block p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">

                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pro Tip</p>

                 <p className="text-xs text-gray-500 font-bold leading-relaxed">Join the loyalty program to start earning points on every purchase!</p>

              </div>

            </div>

  

            {/* Tab Content Area */}

            <div className="flex-1 min-w-0">

              <TabsContent value="gift-card" className="mt-0 outline-none">

                <GiftCardTabContent businessId={listing.id} />

              </TabsContent>

              

              <TabsContent value="loyalty" className="mt-0 outline-none">

                <LoyaltyContent businessId={listing.id} />

              </TabsContent>

  

              <TabsContent value="voucher" className="mt-0 outline-none">

                <VoucherTabContent businessId={listing.id} />

              </TabsContent>

  

              <TabsContent value="coupon" className="mt-0 outline-none">

                <CouponTabContent businessId={listing.id} />

              </TabsContent>

            </div>

          </div>

        </Tabs>

      </div>

    );

  }

  