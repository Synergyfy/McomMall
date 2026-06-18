'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  TrendingUp,
  Coins,
  Megaphone,
  Bell,
  Bolt,
  PlusCircle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Inbox,
  User,
  LayoutDashboard,
  Calendar,
  Layers,
  ShoppingBag,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BusinessToolsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'seasonal' | 'weekend' | 'flash' | 'retention'>('seasonal');

  // Static/mock states for the dashboard
  const [excessCount] = useState(12);
  const [capacityFill] = useState(85);
  const [activeCampaigns] = useState(2);
  const [reachCount] = useState('142.8k');

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans pb-24 md:pb-8">
      {/* ----------------- MOBILE VIEW (block md:hidden) ----------------- */}
      <div className="block md:hidden space-y-6 px-4 py-6">
        {/* Mobile Top AppBar */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e2bfb0]/30">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#ff6900]/10 flex items-center justify-center text-[#ff6900]">
              <Wrench className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-[#a14000] tracking-tight">ShopHub Operations</h1>
          </div>
          <button className="w-8 h-8 rounded-full bg-white border border-[#e2bfb0]/30 flex items-center justify-center text-[#5a4136]">
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Performance Summary Ribbon */}
        <section className="flex gap-3">
          <div 
            onClick={() => router.push('/dashboard/tools/excess-stock')}
            className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-4 flex items-center gap-3 flex-1 cursor-pointer hover:border-[#ff6900] transition-colors"
          >
            <div className="bg-red-50 text-red-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">Excess Stock</p>
              <p className="text-sm font-black text-[#0b1c30] font-mono">{excessCount} items</p>
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard/tools/capacity')}
            className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-4 flex items-center gap-3 flex-1 cursor-pointer hover:border-[#ff6900] transition-colors"
          >
            <div className="bg-emerald-50 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">Capacity</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#0b1c30] font-mono">{capacityFill}%</span>
                <div className="w-12 h-1.5 bg-gray-150 rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${capacityFill}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insight Card */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#a14000] to-[#ff6900] text-white rounded-2xl p-5 shadow-md">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none flex items-center justify-center">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-1.5">
              <Bolt className="w-4 h-4 text-orange-200" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-orange-100">AI Operational Insight</span>
            </div>
            <h2 className="text-base font-extrabold leading-snug">Restaurants like yours are running Lunch Deals today.</h2>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => router.push('/dashboard/tools/campaigns')}
                className="bg-white text-[#a14000] text-[10px] font-extrabold px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-95 transition-all"
              >
                USE TEMPLATE
              </button>
              <button className="text-[10px] font-extrabold px-3 py-2 border border-white/20 rounded-lg hover:bg-white/10 active:scale-95 transition-all">
                DISMISS
              </button>
            </div>
          </div>
        </section>

        {/* Operational Quick Actions */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">Operational Control</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/dashboard/tools/excess-stock')}
              className="bg-white border border-[#e2bfb0]/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center group hover:border-[#ff6900] active:scale-95 transition-all shadow-sm"
            >
              <div className="bg-orange-50 text-[#ff6900] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#0b1c30] tracking-wide">Mark Excess Stock</span>
            </button>

            <button 
              onClick={() => router.push('/dashboard/tools/capacity')}
              className="bg-white border border-[#e2bfb0]/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center group hover:border-[#ff6900] active:scale-95 transition-all shadow-sm"
            >
              <div className="bg-orange-50 text-[#ff6900] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#0b1c30] tracking-wide">Create Instant Offer</span>
            </button>

            <button 
              onClick={() => router.push('/dashboard/tools/campaigns')}
              className="bg-white border border-[#e2bfb0]/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center group hover:border-[#ff6900] active:scale-95 transition-all shadow-sm"
            >
              <div className="bg-orange-50 text-[#ff6900] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
                <Megaphone className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#0b1c30] tracking-wide">Launch Campaign</span>
            </button>

            <button 
              onClick={() => router.push('/dashboard/tools/alerts')}
              className="bg-white border border-[#e2bfb0]/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center group hover:border-[#ff6900] active:scale-95 transition-all shadow-sm"
            >
              <div className="bg-orange-50 text-[#ff6900] w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#0b1c30] tracking-wide">Send Push Alert</span>
            </button>
          </div>
        </section>

        {/* Nearby Engagement & Borough Reach */}
        <section className="space-y-4">
          <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#0b1c30]">Nearby Engagement</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last 7 Days</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold">+14.2%</span>
            </div>
            {/* Sparkline chart bar render */}
            <div className="h-28 w-full flex items-end gap-1.5 mb-2">
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[40%]" title="Mon"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[55%]" title="Tue"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[45%]" title="Wed"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[70%]" title="Thu"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[85%]" title="Fri"></div>
              <div className="bg-[#ff6900] flex-1 rounded-t h-[95%]" title="Sat"></div>
              <div className="bg-orange-200/50 hover:bg-[#ff6900] transition-colors flex-1 rounded-t h-[60%]" title="Sun"></div>
            </div>
            <p className="text-xl font-bold font-mono text-[#a14000]">2,482 <span className="text-xs text-[#5a4136] font-normal">visits</span></p>
          </div>

          <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#0b1c30]">Borough Reach</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Market Penetration</p>
              </div>
              <span className="text-[#a14000] text-xs font-bold font-mono">Top Hubs</span>
            </div>
            <div className="space-y-3 flex-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[#5a4136]">
                  <span>Southwark</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[#5a4136]">
                  <span>Lambeth</span>
                  <span>42%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-[#ff6900]/70 h-full rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[#5a4136]">
                  <span>Lewisham</span>
                  <span>15%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-[#ff6900]/40 h-full rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Activity Feed */}
        <section className="bg-orange-50/50 rounded-2xl p-4 border border-[#e2bfb0]/20 space-y-3">
          <h3 className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">Recent Events</h3>
          <div className="space-y-2">
            <div className="bg-white p-3 rounded-xl flex items-center justify-between border border-[#e2bfb0]/10 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-[#0b1c30]">Offer "Happy Hour 20%" accepted by 45 users.</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-400">2M AGO</span>
            </div>
            <div className="bg-white p-3 rounded-xl flex items-center justify-between border border-[#e2bfb0]/10 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="text-xs text-[#0b1c30]">Inventory Alert: Organic Sourdough low (8 units).</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-gray-400">15M AGO</span>
            </div>
          </div>
        </section>
      </div>

      {/* ----------------- DESKTOP VIEW (hidden md:block) ----------------- */}
      <div className="hidden md:block max-w-7xl mx-auto px-8 py-10 space-y-10">
        {/* Desktop Top AppBar */}
        <div className="flex justify-between items-center pb-6 border-b border-[#e2bfb0]/30">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#ff6900]/10 flex items-center justify-center text-[#ff6900]">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-[#a14000] tracking-tight">Business Tools & Presets</h1>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/tools/campaigns')}
            className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-6 py-5 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Start New Campaign
          </Button>
        </div>

        {/* Hero Info Section */}
        <section className="bg-gradient-to-br from-white to-[#f8f9ff] border border-[#e2bfb0]/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight">Campaign Tools & Templates</h2>
            <p className="text-sm text-[#5a4136]">
              Deploy high-converting marketing campaigns in seconds. Use our validated templates or build your custom outreach strategy to drive growth.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Card className="p-4 bg-white border-[#e2bfb0]/20 shadow-xs flex flex-col items-center justify-center w-28 text-center rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Excess Items</span>
              <span className="text-2xl font-black text-[#a14000] font-mono mt-1">{excessCount}</span>
            </Card>
            <Card className="p-4 bg-white border-[#e2bfb0]/20 shadow-xs flex flex-col items-center justify-center w-28 text-center rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Availability</span>
              <span className="text-2xl font-black text-emerald-600 font-mono mt-1">15%</span>
            </Card>
          </div>
        </section>

        {/* Bento Grid: Active Campaigns & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Campaigns List */}
          <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
                <Bolt className="w-5 h-5 text-[#ff6900]" />
                Active Campaigns
              </h3>
              <button 
                onClick={() => router.push('/dashboard/tools/campaigns')}
                className="text-[#ff6900] text-xs font-bold uppercase tracking-wider hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {/* Campaign Item 1 */}
              <div 
                onClick={() => router.push('/dashboard/tools/excess-stock')}
                className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-transparent hover:border-[#ff6900]/40 hover:bg-white transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#ffdbcc] text-[#a14000] rounded-xl flex items-center justify-center">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0b1c30]">Anniversary Flash Sale</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Running
                      </span>
                      <span className="text-gray-400">• 12.4k Reached</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-black text-[#0b1c30] font-mono">18.4%</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Conv. Rate</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ff6900] transition-colors" />
                </div>
              </div>

              {/* Campaign Item 2 */}
              <div 
                onClick={() => router.push('/dashboard/tools/capacity')}
                className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-transparent hover:border-[#ff6900]/40 hover:bg-white transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-[#ff6900] rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0b1c30]">Early Bird Weekend VIP</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1 font-bold text-[#ff6900]">
                        <span className="w-2 h-2 rounded-full bg-[#ff6900]"></span> Scheduled
                      </span>
                      <span className="text-gray-400">• Starts Friday</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-black text-[#0b1c30] font-mono">4.2k</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target List</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ff6900] transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Side Stat Cards */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-[#a14000] text-white p-6 rounded-3xl relative overflow-hidden shadow-md border-none">
              <div className="relative z-10 space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-orange-200 uppercase tracking-wider">Total Monthly Reach</p>
                  <h3 className="text-3xl font-black font-mono mt-1">{reachCount}</h3>
                </div>
                <div className="flex items-center gap-1 text-orange-200 text-xs font-bold">
                  <TrendingUp className="w-4 h-4" />
                  +24% vs last month
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <Megaphone size={120} />
              </div>
            </Card>

            <Card className="bg-white border border-[#e2bfb0]/30 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#5a4136] uppercase tracking-wider">Credits Remaining</span>
                <span className="text-xs font-bold text-orange-500">84.5%</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#0b1c30] font-mono">8,450</span>
                <span className="text-xs text-gray-400">/ 10,000</span>
              </div>
              <div className="w-full bg-[#f8f9ff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ff6900] h-full rounded-full" style={{ width: '84.5%' }}></div>
              </div>
            </Card>
          </div>

        </div>

        {/* Campaign Library Slider (PRD Sections 13-16) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#0b1c30] tracking-tight">Campaign Library</h3>
              <p className="text-xs text-[#5a4136]">Select a pre-built template to get started instantly.</p>
            </div>
            {/* Category Tabs */}
            <div className="flex border-b border-gray-200">
              {(['seasonal', 'weekend', 'flash', 'retention'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    activeTab === tab 
                      ? 'border-[#ff6900] text-[#a14000]' 
                      : 'border-transparent text-gray-400 hover:text-[#5a4136]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Template Card 1 */}
            <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZjbghb1NTuzLYGMB2eQlDgFQI3NJXtdttY45-EDiExViHf4XGLESxVoWiM1KerZisCnIQA79WFAsKmDSTqLYFaiuCrAOwNQn_RTWy3Uh_9gbJZDf75WsWT1oysQlw2wu1g1mzNjfw0fddNArl10KgK6wEmvt4xPeKtooa_Rer4HzRkJAWb7Li8e6nGgDLOidZtZPa-9XGZWztIurEA0J_vmbx3feHooA2-4YLeMeCHlXNtKNOkw_umoGm40_DvWfXEl9jmVzKQFBD" 
                    alt="Groceries" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#ff6900] text-white px-2 py-0.5 text-[8px] font-bold uppercase rounded">Best Seller</div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-[#0b1c30]">Weekend VIP Cuts</h4>
                  <p className="text-[11px] text-[#5a4136] line-clamp-2">Exclusive loyalty points multiplier for prime grocery sections this weekend.</p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between text-xs mt-3">
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">92% Success</span>
                <button 
                  onClick={() => router.push('/dashboard/tools/campaigns')}
                  className="text-[#ff6900] font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
                >
                  Use <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Template Card 2 */}
            <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_6l73s0hThTrFh7QvIh8vpQicuuBhvJtVKK-kFeDXwcCtKiP1SUikePNBTF0NwW7G_69VmPT15TT5nSznJb1GcTVC0Oa_515RsTkg0xO4RpJL_JzI5IbnG39shjggDG77iCRit-mKRDN5S0IxCZBbztlf-wAe8NH_0BltjW4i7p7l3gtNOTrEIxwYarITxMvxquofV8NvZrF-sCxJfK7ZHI18IaFcLeTeIiaUPBNYyzxuGvPdb3OOPFk58TAyO_u07GoWp3FNiwaJ" 
                    alt="Lunch spread" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-[#0b1c30]">Midweek Lunch Offer</h4>
                  <p className="text-[11px] text-[#5a4136] line-clamp-2">Drive traffic during slow Tuesday-Thursday windows with meal combo deals.</p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between text-xs mt-3">
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">High ROAS</span>
                <button 
                  onClick={() => router.push('/dashboard/tools/campaigns')}
                  className="text-[#ff6900] font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
                >
                  Use <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Template Card 3 */}
            <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzsC-osv1R03yicOu7j37_crg8pC8zd5_0wmaKU99X-kqN22pAaW0dMHmRs7Eow8Itq8Fy7Qo6uQH7yBkDR3jPOEQ7OJiUy8Pe4JKU94TB2I_mlry9be8B88LhqsQyVW2gdnDhdP5klXU5AWp5kuoKCmFZU5_xixtJMa-mOBlq3HyLDY0k0pY7AQ2xmk3q-d8qLpGc-mcbf_mfDYf5XXzuY81SL9sIBvrIteyESX9rWpIpzsMqij5NLCecOaasRdr1C4nWaB0TcbYw" 
                    alt="Sale tag" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-[#0b1c30]">2-Hour Flash Blast</h4>
                  <p className="text-[11px] text-[#5a4136] line-clamp-2">Hyper-urgent SMS and Push notification template for inventory clearance.</p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between text-xs mt-3">
                <span className="text-[10px] font-extrabold text-[#ff6900] bg-orange-50 px-2 py-0.5 rounded">Urgent</span>
                <button 
                  onClick={() => router.push('/dashboard/tools/campaigns')}
                  className="text-[#ff6900] font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
                >
                  Use <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Template Card 4 */}
            <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3Mnd5yXKQBYVTdKqCpkXM4TjBAeYH6Z1ok_nJ6AsN_wfXiN10CAbynockqW5uxv42pE8LjkfNJ_zo4kXS4VIGLZDYbBdCwfBCXjvD1vchfdw-U9xZmR_zF1-79cbqrEWfXxLDQ9OI3cVlhHeBoWG4WdLS8UXrgStDbOSrj2-FXdH69FkmzSUPS4Ru1IklcKgWpMvwrZ8J90QsMMCVEeZ3-2Fne5ksCgHz0mf2JPDFXzMWG2jxwgq_AshUSaIHZDGSFQpe5Ncklkey" 
                    alt="Clothing boutique" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-[#0b1c30]">Loyalty Welcome</h4>
                  <p className="text-[11px] text-[#5a4136] line-clamp-2">Automated greeting and first-purchase discount for new member signups.</p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between text-xs mt-3">
                <span className="text-[10px] font-extrabold text-[#a14000] bg-orange-50 px-2 py-0.5 rounded">Retention</span>
                <button 
                  onClick={() => router.push('/dashboard/tools/campaigns')}
                  className="text-[#ff6900] font-bold flex items-center gap-1 hover:translate-x-1 transition-transform"
                >
                  Use <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Action Grid */}
        <section className="grid grid-cols-4 gap-6">
          <Card 
            onClick={() => router.push('/dashboard/tools/excess-stock')}
            className="p-6 bg-white border-[#e2bfb0]/30 shadow-xs flex flex-col items-center justify-center text-center gap-2 hover:shadow-md cursor-pointer transition-all active:scale-95 group rounded-2xl"
          >
            <span className="w-10 h-10 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase text-[#0b1c30]">Mark Stock</span>
          </Card>
          <Card 
            onClick={() => router.push('/dashboard/tools/capacity')}
            className="p-6 bg-white border-[#e2bfb0]/30 shadow-xs flex flex-col items-center justify-center text-center gap-2 hover:shadow-md cursor-pointer transition-all active:scale-95 group rounded-2xl"
          >
            <span className="w-10 h-10 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
              <Ticket className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase text-[#0b1c30]">Create Offer</span>
          </Card>
          <Card 
            onClick={() => router.push('/dashboard/tools/campaigns')}
            className="p-6 bg-white border-[#e2bfb0]/30 shadow-xs flex flex-col items-center justify-center text-center gap-2 hover:shadow-md cursor-pointer transition-all active:scale-95 group rounded-2xl"
          >
            <span className="w-10 h-10 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase text-[#0b1c30]">Launch Campaign</span>
          </Card>
          <Card 
            onClick={() => router.push('/dashboard/tools/alerts')}
            className="p-6 bg-white border-[#e2bfb0]/30 shadow-xs flex flex-col items-center justify-center text-center gap-2 hover:shadow-md cursor-pointer transition-all active:scale-95 group rounded-2xl"
          >
            <span className="w-10 h-10 rounded-full bg-orange-50 text-[#ff6900] flex items-center justify-center group-hover:bg-[#ff6900] group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase text-[#0b1c30]">Send Push</span>
          </Card>
        </section>
      </div>
    </div>
  );
}
