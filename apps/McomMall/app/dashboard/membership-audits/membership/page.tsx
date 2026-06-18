'use client';

import React, { useState } from 'react';
import { useGetMyMembership } from '@/service/membership/hooks';
import { useGetTiers } from '@/service/tiers/hook';
import PricingCheckoutClient from '@/app/pricing/components/PricingCheckoutClient';
import { PlanType } from '@/service/payments/types';
import { Tier } from '@/service/tiers/types';
import { 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Percent, 
  ChevronRight, 
  Check, 
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MembershipTiersDashboard() {
  const { data: membership, isLoading: isMemberLoading } = useGetMyMembership();
  const { data: tiers, isLoading: isTiersLoading } = useGetTiers();
  
  const [selectedTier, setSelectedTier] = useState<{ tier: Tier; cycle: 'monthly' | 'annual' } | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const isLoading = isMemberLoading || isTiersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 border-4 border-t-[#ff6900] border-orange-100 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Fetching membership configurations...</span>
      </div>
    );
  }

  // If a tier is selected, render the checkout flow component directly in-place
  if (selectedTier) {
    const cyclePrice = billingCycle === 'monthly' ? selectedTier.tier.monthly_price : selectedTier.tier.annual_price;
    const priceString = `£${cyclePrice.toFixed(2)}`;
    const planType = billingCycle === 'monthly' ? PlanType.MONTHLY : PlanType.ANNUAL;

    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-4xl mx-auto my-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Checkout</h3>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedTier(null)}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            ← Back to Tiers
          </Button>
        </div>
        <PricingCheckoutClient
          planName={`${selectedTier.tier.name} (${billingCycle})`}
          planPrice={priceString}
          isTrial={false}
          isPayg={false}
          listingId={null}
          tierId={selectedTier.tier.id}
          planType={planType}
        />
      </div>
    );
  }

  const activeMembership = membership?.isActive ? membership : null;
  const activeTierId = activeMembership?.tier?.id;

  const toggleBillingCycle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly');
  };

  // Sort tiers by price
  const sortedTiers = tiers ? [...tiers].sort((a, b) => a.monthly_price - b.monthly_price) : [];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Current Subscription Summary */}
      {activeMembership ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Plan: {activeMembership.tier?.name}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Renews on {new Date(activeMembership.expiresAt).toLocaleDateString()}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="capitalize">{activeMembership.planType} Billing Cycle</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex items-center gap-4">
              <div className="flex-1 md:flex-initial">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-500">Profile Completeness</span>
                  <span className="text-[#ff6900]">78%</span>
                </div>
                <div className="w-40 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">You are on the Free Plan</h3>
            <p className="text-xs text-gray-500 mt-1">Upgrade to Bronze, Silver, or Gold to showcase your storefront and boost footfall.</p>
          </div>
          <Button 
            onClick={() => document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#ff6900] hover:bg-[#a14000] text-white"
          >
            Select a Plan Below
          </Button>
        </div>
      )}

      {/* Cycle Toggle selector */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-black text-gray-900">Select Your Membership Plan</h3>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Choose a plan that fits your business needs. Save up to 20% with annual billing cycles.
        </p>
        
        <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            Monthly Billing
          </button>
          <button 
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            Annual Billing
            <span className="bg-orange-100 text-[#ff6900] text-[9px] px-1.5 py-0.5 rounded font-black">SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* Horizontal Tier Cards Scroll */}
      <div id="tiers-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedTiers.map((tier) => {
          const isCurrent = activeTierId === tier.id;
          const monthlyPrice = Number(tier.monthly_price);
          const annualPrice = Number(tier.annual_price);
          const displayedPrice = billingCycle === 'monthly' ? monthlyPrice : (annualPrice / 12);
          
          return (
            <div 
              key={tier.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                isCurrent 
                  ? 'border-[#ff6900] ring-1 ring-[#ff6900]/30 bg-[#fcf8f6]/10' 
                  : 'border-gray-200'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[#ff6900] text-white text-[9px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                  Active
                </div>
              )}
              
              <div>
                <h4 className="text-xl font-bold text-gray-800">{tier.name}</h4>
                <p className="text-xs text-gray-400 mt-1 h-8 line-clamp-2 leading-relaxed">
                  {tier.description || 'Boost business operations and expand community reach.'}
                </p>
                
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-950">£{displayedPrice.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 font-medium">/ month</span>
                </div>
                {billingCycle === 'annual' && (
                  <span className="text-[10px] text-orange-600 font-semibold mt-1 block">
                    Billed £{annualPrice.toFixed(2)} yearly
                  </span>
                )}
                
                <div className="mt-6 border-t border-gray-100 pt-5 space-y-3.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Features:</span>
                  <ul className="space-y-2.5">
                    {tier.features?.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-[#ff6900] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-4">
                <Button 
                  disabled={isCurrent}
                  onClick={() => setSelectedTier({ tier, cycle: billingCycle })}
                  className={`w-full py-5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                    isCurrent 
                      ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 border-none' 
                      : 'bg-[#ff6900] hover:bg-[#a14000] text-white shadow-md shadow-orange-600/10'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tiers Comparison Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h4 className="text-lg font-bold text-gray-900 mb-6">Compare Plans Side-by-Side</h4>
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 font-bold text-gray-800 text-sm">Privileges & Benefits</th>
                {sortedTiers.map(t => (
                  <th key={t.id} className="py-4 px-4 font-extrabold text-gray-900 text-center text-sm">{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Priority rotators in Local Search</td>
                <td className="py-4 px-4 text-center text-gray-400">None</td>
                <td className="py-4 px-4 text-center text-gray-500">Bronze priority</td>
                <td className="py-4 px-4 text-center text-orange-600 font-bold">Silver priority</td>
                <td className="py-4 px-4 text-center text-orange-600 font-black">Top Priority</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Digital Storefront Custom Branding</td>
                <td className="py-4 px-4 text-center text-gray-400">Basic styling</td>
                <td className="py-4 px-4 text-center text-gray-500">Custom colors</td>
                <td className="py-4 px-4 text-center text-center"><Check className="w-4 h-4 text-[#ff6900] mx-auto" /></td>
                <td className="py-4 px-4 text-center text-center"><Check className="w-4 h-4 text-[#ff6900] mx-auto" /></td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Loyalty Vouchers Campaigns Limit</td>
                <td className="py-4 px-4 text-center text-gray-400">1 standard campaign</td>
                <td className="py-4 px-4 text-center text-gray-500">3 campaigns</td>
                <td className="py-4 px-4 text-center text-gray-800 font-bold">10 campaigns</td>
                <td className="py-4 px-4 text-center text-gray-950 font-black">Unlimited</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Storefront Health Audits</td>
                <td className="py-4 px-4 text-center text-gray-500">Short audits</td>
                <td className="py-4 px-4 text-center text-gray-500">Short audits</td>
                <td className="py-4 px-4 text-center text-center"><Check className="w-4 h-4 text-[#ff6900] mx-auto" /></td>
                <td className="py-4 px-4 text-center text-center"><Check className="w-4 h-4 text-[#ff6900] mx-auto" /></td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Customer Analytics Insights</td>
                <td className="py-4 px-4 text-center text-gray-400">Monthly reports</td>
                <td className="py-4 px-4 text-center text-gray-400">Weekly reports</td>
                <td className="py-4 px-4 text-center text-gray-850 font-bold">Realtime + weekly</td>
                <td className="py-4 px-4 text-center text-gray-950 font-black">Advanced CRM access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
