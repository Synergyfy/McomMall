'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Calendar,
  TrendingUp,
  Layers,
  RefreshCw
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

      {/* Quick Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Membership Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Upgrade Plan */}
          <button 
            onClick={() => document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Upgrade Plan</h5>
            <p className="text-xs text-gray-400 mt-1">Explore higher tiers to boost storefront footfall and search priority</p>
          </button>

          {/* Compare Plans */}
          <button 
            onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Compare Plans</h5>
            <p className="text-xs text-gray-400 mt-1">Compare features, limits, and pricing side-by-side</p>
          </button>

          {/* Renew Membership */}
          <button 
            onClick={() => {
              if (activeMembership && activeMembership.tier) {
                setSelectedTier({ tier: activeMembership.tier, cycle: activeMembership.planType === 'annual' ? 'annual' : 'monthly' });
              } else {
                document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Renew Membership</h5>
            <p className="text-xs text-gray-400 mt-1">Extend your current plan cycle or manage your active subscription</p>
          </button>

          {/* Contact Support */}
          <Link 
            href="/dashboard/support-tickets"
            className="flex flex-col items-start p-5 rounded-xl border border-gray-150 hover:border-[#ff6900]/40 hover:bg-[#fcf8f6]/30 transition-all text-left group w-full"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff6900] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-sm text-gray-800 group-hover:text-[#ff6900] transition-colors">Contact Support</h5>
            <p className="text-xs text-gray-400 mt-1">Talk to our customer service and billing team</p>
          </Link>
        </div>
      </div>

      {/* Current Features vs Locked Features */}
      {activeMembership ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Your Plan Privileges</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Active Features */}
            <div className="space-y-4">
              <h5 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5" />
                Active Benefits
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Storefront Access</span>
                  <span className="text-emerald-600 font-bold">Included</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Promotions Access</span>
                  <span className="text-emerald-600 font-bold">Included</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Campaign Access</span>
                  <span className="text-emerald-600 font-bold">Up to {activeMembership.tier?.configuration?.quotas?.maxActiveCampaigns || 3} campaigns</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Gamification Access</span>
                  <span className="text-emerald-600 font-bold">
                    {activeMembership.tier?.name.toLowerCase().includes('gold') || activeMembership.tier?.name.toLowerCase().includes('platinum') ? 'Full access' : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Rotator Access</span>
                  <span className="text-emerald-600 font-bold">
                    {activeMembership.tier?.configuration?.featureFlags?.priorityInSearch ? 'Priority rotator' : 'Standard rotator'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Borough Visibility</span>
                  <span className="text-emerald-600 font-bold">
                    {activeMembership.tier?.name.toLowerCase().includes('gold') || activeMembership.tier?.name.toLowerCase().includes('platinum') ? 'Extended Reach' : 'Local Proximity'}
                  </span>
                </div>
              </div>
            </div>

            {/* Locked Features / Upgrades */}
            <div className="space-y-4">
              <h5 className="text-sm font-bold text-amber-600 flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-5 h-5" />
                Locked Features (Upgrade to unlock)
              </h5>
              <div className="space-y-3">
                {(!activeMembership.tier?.name.toLowerCase().includes('gold') && !activeMembership.tier?.name.toLowerCase().includes('platinum')) && (
                  <div className="flex justify-between items-center bg-amber-50/30 border border-amber-100 p-3 rounded-xl">
                    <div>
                      <h6 className="font-bold text-xs text-gray-800">Advanced Analytics CRM</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">Realtime customer conversion and journey details.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-[#ff6900] hover:bg-[#a14000] text-white text-[10px] py-1.5 px-3 h-8 rounded-lg font-bold"
                    >
                      Upgrade
                    </Button>
                  </div>
                )}

                {!activeMembership.tier?.name.toLowerCase().includes('platinum') && (
                  <div className="flex justify-between items-center bg-amber-50/30 border border-amber-100 p-3 rounded-xl">
                    <div>
                      <h6 className="font-bold text-xs text-gray-800">Featured Placement & Max Priority</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">Top search index rotator slots & billboard promotions.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-[#ff6900] hover:bg-[#a14000] text-white text-[10px] py-1.5 px-3 h-8 rounded-lg font-bold"
                    >
                      Upgrade
                    </Button>
                  </div>
                )}

                {activeMembership.tier?.name.toLowerCase().includes('bronze') && (
                  <div className="flex justify-between items-center bg-amber-50/30 border border-amber-100 p-3 rounded-xl">
                    <div>
                      <h6 className="font-bold text-xs text-gray-800">Custom Branding styling</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">Tailor background cards and color codes for storefronts.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-[#ff6900] hover:bg-[#a14000] text-white text-[10px] py-1.5 px-3 h-8 rounded-lg font-bold"
                    >
                      Upgrade
                    </Button>
                  </div>
                )}

                {(!activeMembership.tier?.name.toLowerCase().includes('gold') && !activeMembership.tier?.name.toLowerCase().includes('platinum')) && (
                  <div className="flex justify-between items-center bg-amber-50/30 border border-amber-100 p-3 rounded-xl">
                    <div>
                      <h6 className="font-bold text-xs text-gray-800">Flow Builder & QR Engine automations</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5">Automate stamp distribution on user check-in scan events.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => document.getElementById('tiers-container')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-[#ff6900] hover:bg-[#a14000] text-white text-[10px] py-1.5 px-3 h-8 rounded-lg font-bold"
                    >
                      Upgrade
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
      <div id="comparison-table" className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden">
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
            <tbody className="divide-y divide-gray-150 text-gray-600">
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Visibility & Search Priority</td>
                {sortedTiers.map(t => {
                  const name = t.name.toLowerCase();
                  let text = "Standard";
                  if (name.includes('bronze')) text = "Bronze Boost";
                  else if (name.includes('silver')) text = "Silver Priority";
                  else if (name.includes('gold')) text = "High Gold Priority";
                  else if (name.includes('platinum')) text = "Maximum Placement Rotator";
                  return <td key={t.id} className="py-4 px-4 text-center font-medium text-gray-800">{text}</td>;
                })}
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Campaigns Limit</td>
                {sortedTiers.map(t => {
                  const name = t.name.toLowerCase();
                  let text = "1 active campaign";
                  if (name.includes('bronze')) text = "3 active campaigns";
                  else if (name.includes('silver')) text = "10 active campaigns";
                  else if (name.includes('gold')) text = "25 active campaigns";
                  else if (name.includes('platinum')) text = "Unlimited campaigns";
                  return <td key={t.id} className="py-4 px-4 text-center font-medium text-gray-800">{text}</td>;
                })}
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Reward Stamp Cards & Coupons</td>
                {sortedTiers.map(t => {
                  const name = t.name.toLowerCase();
                  let text = "1 active program";
                  if (name.includes('bronze')) text = "3 active programs";
                  else if (name.includes('silver')) text = "10 active programs";
                  else if (name.includes('gold')) text = "Unlimited programs";
                  else if (name.includes('platinum')) text = "Unlimited + Advanced Loyalty";
                  return <td key={t.id} className="py-4 px-4 text-center font-medium text-gray-800">{text}</td>;
                })}
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Marketing Automation</td>
                {sortedTiers.map(t => {
                  const name = t.name.toLowerCase();
                  let text = "None";
                  if (name.includes('bronze')) text = "Basic";
                  else if (name.includes('silver')) text = "Flow Templates";
                  else if (name.includes('gold')) text = "Flow Builder access";
                  else if (name.includes('platinum')) text = "Advanced CRM Automations";
                  return <td key={t.id} className="py-4 px-4 text-center font-medium text-gray-800">{text}</td>;
                })}
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Featured High-Street Placement</td>
                {sortedTiers.map(t => {
                  const name = t.name.toLowerCase();
                  let text = "None";
                  if (name.includes('bronze')) text = "None";
                  else if (name.includes('silver')) text = "2 active slots";
                  else if (name.includes('gold')) text = "5 active slots";
                  else if (name.includes('platinum')) text = "10 Featured Placements";
                  return <td key={t.id} className="py-4 px-4 text-center font-medium text-gray-800">{text}</td>;
                })}
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 font-semibold text-gray-700">Support Levels</td>
                {sortedTiers.map(t => {
                  const name = t.name.toLowerCase();
                  let text = "Email support";
                  if (name.includes('bronze')) text = "Priority tickets";
                  else if (name.includes('silver')) text = "Priority tickets & chat";
                  else if (name.includes('gold')) text = "Dedicated agent support";
                  else if (name.includes('platinum')) text = "24/7 Premium Support (1-hr SLA)";
                  return <td key={t.id} className="py-4 px-4 text-center font-medium text-gray-800">{text}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
