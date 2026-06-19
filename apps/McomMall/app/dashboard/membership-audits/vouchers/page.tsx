'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Ticket, 
  ArrowRight, 
  Calendar, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Info,
  DollarSign,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Gift,
  Search,
  Check,
  X,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VouchersCreditsDashboard() {
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed' | 'expired' | 'promotional' | 'service'>('available');
  const [showEmptyState, setShowEmptyState] = useState(false);
  
  // Redemption Flow Wizard state
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionStep, setRedemptionStep] = useState(1);
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedUsage, setSelectedUsage] = useState<string | null>(null);

  // Apply Voucher Modal state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Available and historical credits data conforming to PRD requirements
  const creditsList = [
    { 
      id: 'c-1', 
      title: 'Welcome Challenge Reward', 
      type: 'onboarding credit', 
      amount: 50.00, 
      status: 'available', 
      expiry: 'July 15, 2026',
      desc: 'Granted upon completing basic merchant onboarding setup.'
    },
    { 
      id: 'c-2', 
      title: 'Borough Summer Promotion', 
      type: 'borough promotion credit', 
      amount: 150.00, 
      status: 'available', 
      expiry: 'July 25, 2026',
      desc: 'Local high-street activation allowance for district merchant groups.'
    },
    { 
      id: 'c-3', 
      title: 'Featured Rotator Slot Credit', 
      type: 'featured placement credit', 
      amount: 200.00, 
      status: 'available', 
      expiry: 'July 10, 2026',
      desc: 'Boosts visibility inside local borough search index rotators.'
    },
    { 
      id: 'c-4', 
      title: 'Merchant Referral Bonus', 
      type: 'referral credit', 
      amount: 100.00, 
      status: 'available', 
      expiry: 'August 01, 2026',
      desc: 'Allocated for introducing neighboring high street businesses.'
    },
    { 
      id: 'c-5', 
      title: 'Customer Feedback Stamp Reward', 
      type: 'reward credit', 
      amount: 40.00, 
      status: 'redeemed', 
      date: '2026-06-10',
      desc: 'Unlocked for running stamp loyalty rewards campaigns.'
    },
    { 
      id: 'c-6', 
      title: 'Welcome Campaign Package', 
      type: 'campaign credit', 
      amount: 240.00, 
      status: 'redeemed', 
      date: '2026-06-01',
      desc: 'Initial campaign budget matching silver level benefits.'
    },
    { 
      id: 'c-7', 
      title: 'Spring Rotator Launch Offset', 
      type: 'featured placement credit', 
      amount: 80.00, 
      status: 'expired', 
      date: '2026-05-15',
      desc: 'Unused featured promotion credits from previous quarter.'
    },
  ];

  // Helper filters
  const availableCredits = creditsList.filter(c => c.status === 'available');
  const redeemedCredits = creditsList.filter(c => c.status === 'redeemed');
  const expiredCredits = creditsList.filter(c => c.status === 'expired');
  const promoCredits = creditsList.filter(c => c.type.includes('promotion') || c.type.includes('campaign') || c.type.includes('placement'));
  const serviceCredits = creditsList.filter(c => c.type.includes('onboarding') || c.type.includes('referral') || c.type.includes('reward'));

  const activeCreditForWizard = creditsList.find(c => c.id === selectedCreditId);

  // Quick Action functions
  const handleRedeemCreditClick = () => {
    setIsRedeeming(true);
    setRedemptionStep(1);
    setSelectedCreditId(availableCredits[0]?.id || null);
    setSelectedUsage(null);
  };

  const handleApplyVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voucherCode.trim()) {
      setVoucherApplied(true);
      setTimeout(() => {
        setShowVoucherModal(false);
        setVoucherApplied(false);
        setVoucherCode('');
      }, 1800);
    }
  };

  // Step wizard confirm handler
  const handleApplyRedemption = () => {
    setRedemptionStep(4);
    setTimeout(() => {
      setIsRedeeming(false);
      setRedemptionStep(1);
      setSelectedCreditId(null);
      setSelectedUsage(null);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* State Preview Toggle */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-150 shadow-inner">
        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-gray-400" />
          Preview Toggle:
        </span>
        <div className="flex gap-1.5">
          <Button 
            variant={!showEmptyState ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowEmptyState(false)}
            className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${!showEmptyState ? 'bg-[#ff6900] hover:bg-[#a14000] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Active Credits
          </Button>
          <Button 
            variant={showEmptyState ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowEmptyState(true)}
            className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${showEmptyState ? 'bg-[#ff6900] hover:bg-[#a14000] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Empty State (No Credits)
          </Button>
        </div>
      </div>

      {!showEmptyState ? (
        <>
          {/* VOUCHERS & CREDITS DASHBOARD HEADER METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Metric 1: Available Credits */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Available Credits</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-3xl font-black text-gray-900">$500.00</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Ready for campaigns allocation</p>
            </div>

            {/* Metric 2: Redeemed Credits */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Redeemed Credits</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-2xl font-bold text-gray-800">$280.00</span>
              </div>
              <p className="text-[10px] text-emerald-600 mt-2 font-semibold">Active value injected in store</p>
            </div>

            {/* Metric 3: Expiring Credits */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Expiring Credits</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-2xl font-bold text-orange-600">$200.00</span>
              </div>
              <p className="text-[10px] text-orange-500 mt-2 font-semibold">Expires in 12 days</p>
            </div>

            {/* Metric 4: Voucher Usage */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Voucher Usage</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-2xl font-bold text-gray-800">4 / 7</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Credits successfully applied</p>
            </div>

            {/* Metric 5: Membership Benefits Used */}
            <div className="bg-gradient-to-r from-orange-50/40 to-red-50/40 border border-orange-100/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-orange-950 font-bold block">Benefits Claimed</span>
                <span className="text-2xl font-black text-orange-900 mt-1 block">82%</span>
              </div>
              <p className="text-[10px] text-orange-700/80 font-bold mt-2 flex items-center gap-1">
                Rotator & analytics slots active
              </p>
            </div>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Action Operations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={handleRedeemCreditClick}
                className="bg-[#ff6900] hover:bg-[#a14000] text-white py-6 rounded-xl font-bold text-xs shadow-md shadow-orange-600/10 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Redeem Credit
              </Button>
              <Button 
                onClick={() => setShowVoucherModal(true)}
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Apply Voucher
              </Button>
              <Button 
                onClick={() => {
                  setActiveTab('redeemed');
                  document.getElementById('tabs-container')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" />
                View Usage Log
              </Button>
              <Link href="/dashboard/membership-audits/membership" className="w-full">
                <Button 
                  variant="outline" 
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Purchase Credits
                </Button>
              </Link>
            </div>
          </div>

          {/* INTERACTIVE REDEMPTION FLOW WIZARD */}
          {isRedeeming && (
            <div className="bg-gradient-to-br from-white to-[#fcf8f6]/30 border-2 border-[#ff6900]/30 rounded-3xl p-6 shadow-md space-y-6 relative overflow-hidden">
              <button 
                onClick={() => setIsRedeeming(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#ff6900] animate-pulse" />
                <h3 className="text-base font-bold text-gray-900">Credit Redemption Flow</h3>
              </div>

              {/* Progress Stepper */}
              <div className="flex justify-between items-center max-w-md mx-auto py-3">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      redemptionStep === step 
                        ? 'bg-[#ff6900] text-white ring-4 ring-orange-100' 
                        : redemptionStep > step 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-150 text-gray-400'
                    }`}>
                      {redemptionStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full ${
                        redemptionStep > step ? 'bg-emerald-500' : 'bg-gray-150'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Contents */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm max-w-3xl mx-auto">
                {/* STEP 1: Select Credit */}
                {redemptionStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center max-w-md mx-auto">
                      <h4 className="font-bold text-sm text-gray-850">Step 1 — Choose Available Credit</h4>
                      <p className="text-xs text-gray-500 mt-1">Select one of your active earned growth credits to redeem.</p>
                    </div>
                    <div className="space-y-3">
                      {availableCredits.map(c => (
                        <label 
                          key={c.id} 
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedCreditId === c.id 
                              ? 'border-[#ff6900] bg-[#fcf8f6]/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="selectedCredit" 
                              checked={selectedCreditId === c.id} 
                              onChange={() => setSelectedCreditId(c.id)}
                              className="text-[#ff6900] focus:ring-[#ff6900]"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-800">{c.title}</span>
                              <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{c.type}</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#ff6900]">${c.amount.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end pt-3">
                      <Button 
                        disabled={!selectedCreditId}
                        onClick={() => setRedemptionStep(2)}
                        className="bg-[#ff6900] hover:bg-[#a14000] text-white font-bold text-xs"
                      >
                        Next: Select Usage
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Select Usage */}
                {redemptionStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center max-w-md mx-auto">
                      <h4 className="font-bold text-sm text-gray-850">Step 2 — Select Usage Area</h4>
                      <p className="text-xs text-gray-500 mt-1">Where would you like to apply the ${activeCreditForWizard?.amount.toFixed(2)} balance?</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'promotions', label: 'Cashback Promotions', desc: 'Sponsor user cashback stamp campaigns' },
                        { key: 'borough', label: 'Borough Campaigns', desc: 'Boost listings search priority inside the Borough Mall' },
                        { key: 'rotators', label: 'Rotator Campaigns', desc: 'Purchase premium billboard rotator slots' },
                        { key: 'storefront', label: 'Storefront SEO Boost', desc: 'Automate search tags indexing for products' },
                        { key: 'visibility', label: 'Event Visibility', desc: 'Increase ticket display visibility inside calendar events' }
                      ].map(usage => (
                        <label 
                          key={usage.key}
                          className={`p-4 rounded-xl border cursor-pointer text-left flex flex-col justify-between transition-all ${
                            selectedUsage === usage.key 
                              ? 'border-[#ff6900] bg-[#fcf8f6]/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input 
                              type="radio" 
                              name="selectedUsage" 
                              checked={selectedUsage === usage.key}
                              onChange={() => setSelectedUsage(usage.key)}
                              className="text-[#ff6900] focus:ring-[#ff6900] mt-0.5"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-800">{usage.label}</span>
                              <p className="text-[10px] text-gray-500 mt-0.5">{usage.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-between pt-3">
                      <Button 
                        variant="outline"
                        onClick={() => setRedemptionStep(1)}
                        className="text-xs border-gray-200"
                      >
                        Back
                      </Button>
                      <Button 
                        disabled={!selectedUsage}
                        onClick={() => setRedemptionStep(3)}
                        className="bg-[#ff6900] hover:bg-[#a14000] text-white font-bold text-xs"
                      >
                        Next: Preview Benefits
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Preview Benefit */}
                {redemptionStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center max-w-md mx-auto">
                      <h4 className="font-bold text-sm text-gray-850">Step 3 — Preview Access & Visibility Increase</h4>
                      <p className="text-xs text-gray-500 mt-1">Review your expected optimization impact before applying credits.</p>
                    </div>
                    
                    <div className="border border-orange-100 rounded-xl p-5 bg-[#fcf8f6]/40 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-[#ff6900] flex items-center justify-center animate-bounce">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Expected Impact</span>
                        <h5 className="text-lg font-black text-gray-900">+32% Expected Footfall Reach</h5>
                        <p className="text-xs text-gray-500 max-w-md mt-1 leading-relaxed">
                          Applying the ${activeCreditForWizard?.amount.toFixed(2)} credit to the <span className="font-bold text-[#ff6900] capitalize">{selectedUsage}</span> sector increases search placement indices, boosting visitor traffic rates.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between pt-3">
                      <Button 
                        variant="outline"
                        onClick={() => setRedemptionStep(2)}
                        className="text-xs border-gray-200"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleApplyRedemption}
                        className="bg-[#ff6900] hover:bg-[#a14000] text-white font-bold text-xs"
                      >
                        Apply Credit Now
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Confirm Membership / Credit Activation */}
                {redemptionStep === 4 && (
                  <div className="py-8 text-center space-y-4 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-gray-900">Credit Active & Applied!</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Your growth capital has been successfully allocated. Search indexes and promotions eligibility updated instantly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VOUCHERS LISTING TABS VIEW */}
          <div id="tabs-container" className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
            <div className="flex border-b border-gray-150 mb-6 gap-6 overflow-x-auto whitespace-nowrap">
              {[
                { key: 'available', label: `Available (${availableCredits.length})` },
                { key: 'redeemed', label: `Redeemed (${redeemedCredits.length})` },
                { key: 'expired', label: `Expired (${expiredCredits.length})` },
                { key: 'promotional', label: `Promo Credits (${promoCredits.length})` },
                { key: 'service', label: `Service Credits (${serviceCredits.length})` }
              ].map((tab) => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-3.5 text-sm font-bold border-b-2 transition-all shrink-0 ${
                    activeTab === tab.key 
                      ? 'border-[#ff6900] text-[#ff6900]' 
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List based on Active Tab */}
            <div className="space-y-4">
              {(() => {
                let currentList = availableCredits;
                if (activeTab === 'redeemed') currentList = redeemedCredits;
                else if (activeTab === 'expired') currentList = expiredCredits;
                else if (activeTab === 'promotional') currentList = promoCredits;
                else if (activeTab === 'service') currentList = serviceCredits;

                if (currentList.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-xs text-gray-400">No credits found for this category.</p>
                    </div>
                  );
                }

                return currentList.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-orange-100 transition-all bg-[#fcf8f6]/5">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0 border border-orange-100">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-bold text-gray-850 text-sm">{c.title}</h4>
                          <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-black uppercase">
                            {c.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xl">
                          {c.desc}
                        </p>
                        <span className="text-[10px] text-gray-400 font-semibold mt-1.5 block flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-300" />
                          {c.status === 'available' ? `Expiry: ${c.expiry}` : c.status === 'redeemed' ? `Redeemed on: ${c.date}` : `Expired on: ${c.date}`}
                        </span>
                      </div>
                    </div>
                    
                    {c.status === 'available' ? (
                      <Button 
                        onClick={() => {
                          setIsRedeeming(true);
                          setSelectedCreditId(c.id);
                          setRedemptionStep(1);
                        }}
                        className="bg-[#ff6900] hover:bg-[#a14000] text-white text-xs font-bold w-full md:w-auto flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/10 py-5 px-5 rounded-xl shrink-0"
                      >
                        Redeem Balance
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 ${
                        c.status === 'redeemed' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                      }`}>
                        {c.status === 'redeemed' ? 'Fully Applied' : 'Expired'}
                      </span>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </>
      ) : (
        /* Vouchers Empty State Page */
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center py-16 space-y-6 max-w-3xl mx-auto">
          <div className="relative w-28 h-20 flex items-center justify-center text-gray-200">
            <div className="absolute w-20 h-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl transform -rotate-12 shadow-sm flex items-center justify-center">
              <Ticket className="w-5 h-5 text-gray-300" />
            </div>
            <div className="absolute w-20 h-12 bg-white border-2 border-dashed border-gray-300 rounded-xl transform rotate-6 shadow-md flex items-center justify-center">
              <Ticket className="w-5 h-5 text-orange-200" />
            </div>
          </div>
          
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-black text-gray-900">No Active Growth Credits</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              You currently have no available promotional credit balances. Build up capital and claim campaigns credits by optimizing listing properties, verification, or setting up loyalty reward programs.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/membership-audits/audits/short">
              <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white text-xs font-bold py-5 px-6 rounded-xl shadow-md shadow-orange-600/10">
                Run Diagnostic Audit
              </Button>
            </Link>
            <Link href="/dashboard/membership-audits/membership">
              <Button variant="outline" className="border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold py-5 px-6 rounded-xl">
                View Benefits List
              </Button>
            </Link>
          </div>

          <div className="bg-[#fcf8f6]/50 border border-orange-100 rounded-2xl p-5 text-left flex gap-3 max-w-lg mt-4">
            <Info className="w-5 h-5 text-[#ff6900] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-orange-950">How do credits work?</h4>
              <p className="text-[11px] text-orange-850/80 mt-1.5 leading-relaxed">
                As a Silver or Gold member, you are assigned quarterly growth voucher offsets. Complete local challenges to unlock these balances, which can be applied directly to listing campaigns or local marketing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border rounded-3xl p-6 shadow-xl max-w-md w-full relative">
            <button 
              onClick={() => setShowVoucherModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Apply Voucher Code</h3>
            <p className="text-xs text-gray-500 mb-6">Enter your promotional code to add credits directly into your Growth balance.</p>
            
            {voucherApplied ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">Voucher Added Successfully!</h4>
                <p className="text-xs text-gray-500">+$100.00 Campaign Credits has been added.</p>
              </div>
            ) : (
              <form onSubmit={handleApplyVoucherSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Voucher Code</label>
                  <input 
                    type="text" 
                    required
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="e.g. HIGHSTREET100" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#ff6900]" 
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-[#ff6900] hover:bg-[#a14000] text-white w-full py-5 font-bold text-xs rounded-xl"
                >
                  Apply Voucher Offset
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
