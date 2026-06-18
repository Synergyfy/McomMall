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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VouchersCreditsDashboard() {
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Available incentives data
  const availableIncentives = [
    {
      id: 'inc-1',
      title: 'Complete Profile Setup Bonus',
      reward: '$50.00 Placement Credit',
      desc: 'Verify your store coordinates and update listing hours to claim high-street placement benefits.',
      progress: '78% complete',
      actionText: 'Update Profile',
      actionLink: '/dashboard/storefront',
    },
    {
      id: 'inc-2',
      title: 'Create Your First Loyalty Stamp Card',
      reward: '$100.00 Campaign Credit',
      desc: 'Launch a digital stamps card to rewards loyal customers and boost checkout frequency.',
      progress: 'Not started',
      actionText: 'Create Program',
      actionLink: '/dashboard/loyalty',
    },
    {
      id: 'inc-3',
      title: 'Sync Google Business Listing',
      reward: '$150.00 Placement Credit',
      desc: 'Connect your verified Google profile with McomMall search indexes to claim search priority.',
      progress: 'Pending verification',
      actionText: 'Link Profile',
      actionLink: '/dashboard/membership-audits/audits',
    }
  ];

  // Redeemed incentives history data
  const redeemedHistory = [
    {
      id: 'red-1',
      title: 'Silver Membership Trial Incentive',
      reward: '$100.00 Promo Credit',
      date: '2026-06-11',
      status: 'Fully Redeemed',
    },
    {
      id: 'red-2',
      title: 'Storefront Registration Bonus',
      reward: '$40.00 Campaign Credit',
      date: '2026-06-05',
      status: 'Fully Redeemed',
    }
  ];

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
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Total Growth Capital</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-3xl font-black text-gray-900">$1,240.00</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Credits allocated to promotion</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Campaigns Credit</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-2xl font-bold text-gray-800">$240.00</span>
              </div>
              <p className="text-[10px] text-emerald-600 mt-2 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                Active on listing promos
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Promotions Credit</span>
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-2xl font-bold text-gray-800">$500.00</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Pending cashback budgets</p>
            </div>

            {/* Expiry / Placement Card */}
            <div className="bg-gradient-to-r from-orange-50/40 to-red-50/40 border border-orange-100/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-orange-950 font-bold block">Placement Credit</span>
                  <span className="text-2xl font-black text-orange-900 mt-1 block">$500.00</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-[#ff6900] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-orange-700/80 font-bold mt-3.5 flex items-center gap-1">
                Expires in 12 days (July 1st)
              </p>
            </div>
          </div>

          {/* Sub-tabs List */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
            <div className="flex border-b border-gray-150 mb-6 gap-6">
              <button 
                onClick={() => setActiveTab('available')}
                className={`pb-3.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'available' 
                    ? 'border-[#ff6900] text-[#ff6900]' 
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Available Incentives ({availableIncentives.length})
              </button>
              <button 
                onClick={() => setActiveTab('redeemed')}
                className={`pb-3.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'redeemed' 
                    ? 'border-[#ff6900] text-[#ff6900]' 
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Redeemed History ({redeemedHistory.length})
              </button>
            </div>

            {activeTab === 'available' ? (
              <div className="space-y-4">
                {availableIncentives.map((inc) => (
                  <div key={inc.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-orange-100 transition-all">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0 border border-orange-100">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-bold text-gray-850 text-sm">{inc.title}</h4>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            {inc.reward}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xl">
                          {inc.desc}
                        </p>
                        <span className="text-[10px] text-gray-400 font-semibold mt-1.5 block">
                          Status: {inc.progress}
                        </span>
                      </div>
                    </div>
                    
                    <Link href={inc.actionLink} className="w-full md:w-auto shrink-0">
                      <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white text-xs font-bold w-full md:w-auto flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/10 py-5 px-5 rounded-xl">
                        {inc.actionText}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                      <th className="py-3 pr-4">Claim Date</th>
                      <th className="py-3 px-4">Credit Description</th>
                      <th className="py-3 px-4 text-center">Reward Allocated</th>
                      <th className="py-3 pl-4 text-right">Redemption Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {redeemedHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 pr-4 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{item.title}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">{item.reward}</td>
                        <td className="py-3.5 pl-4 text-right text-gray-400 font-bold flex justify-end items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Vouchers Empty State Page (mapping Page 8) */
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center py-16 space-y-6 max-w-3xl mx-auto">
          {/* Overlapping tickets illustrations */}
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
    </div>
  );
}
