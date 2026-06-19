'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetStorefrontReport } from '@/service/stats/hook';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Info, 
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Store,
  DollarSign,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsDashboard() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const { data: report, isLoading } = useGetStorefrontReport(period);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-8 h-8 border-4 border-t-[#ff6900] border-orange-100 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium">Loading storefront analytics...</span>
      </div>
    );
  }

  const trafficData = report?.trafficTrends || [];
  const metrics = report?.metrics;
  const suggestedActions = report?.suggestedActions || [];

  const formattedChartData = trafficData.map(item => {
    // Format date string from YYYY-MM-DD to just MM-DD or day of week
    const dateObj = new Date(item.date);
    const label = period === 'weekly' 
      ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) 
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      ...item,
      name: label,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Controls & Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Traffic & Conversion Analytics</h3>
          <p className="text-xs text-gray-500">Track local shoppers and conversion trends across your borough.</p>
        </div>

        {/* Weekly / Monthly cycle buttons */}
        <div className="inline-flex items-center gap-2 bg-gray-150 p-1 rounded-xl border border-gray-250 w-fit">
          <button 
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'weekly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            Weekly view
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
          >
            Monthly view
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Analytics metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Total Customers</span>
              <span className="text-3xl font-black text-gray-950 mt-2 block">{metrics.totalCustomers.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-2 font-medium block">
                Shoppers who entered your storefront
              </span>
            </div>

            <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Total Passersby</span>
              <span className="text-3xl font-black text-gray-950 mt-2 block">{metrics.totalPassersby.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-2 font-medium block">
                Unique local shoppers nearby
              </span>
            </div>

            <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Conversion Rate</span>
              <span className="text-3xl font-black text-gray-950 mt-2 block">{metrics.conversionRate}%</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +1.2% conversion increase
              </span>
            </div>

            <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block">Borough Activity Rank</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-gray-950">#{metrics.boroughRank}</span>
                <span className="text-xs text-gray-400">of 85 shops</span>
              </div>
              <span className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${
                metrics.boroughRankChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {metrics.boroughRankChange >= 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{metrics.boroughRankChange} ranks vs last week
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    {metrics.boroughRankChange} ranks vs last week
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Performance Categories conforming to PRD 18 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Performance Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category 1: Storefront Performance */}
              <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Storefront Performance</span>
                  <Store className="w-4 h-4 text-[#ff6900]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Views</span>
                    <span className="font-bold text-gray-800">1,840 views</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Completeness</span>
                    <span className="font-bold text-[#ff6900]">78%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Avg View Time</span>
                    <span className="font-bold text-gray-800">45s</span>
                  </div>
                </div>
              </div>

              {/* Category 2: Promotion Results */}
              <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Promotion Results</span>
                  <Ticket className="w-4 h-4 text-[#ff6900]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Stamps Claimed</span>
                    <span className="font-bold text-gray-800">142 claimed</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Vouchers Redeemed</span>
                    <span className="font-bold text-gray-800">58 redeemed</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Click-through Rate</span>
                    <span className="font-bold text-emerald-600">4.8% CTR</span>
                  </div>
                </div>
              </div>

              {/* Category 3: Engagement Results */}
              <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Engagement Results</span>
                  <Users className="w-4 h-4 text-[#ff6900]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Review Rating</span>
                    <span className="font-bold text-gray-800">4.8 ★</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Repeat Customer Rate</span>
                    <span className="font-bold text-gray-800">22% repeat</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Loyalty Enrollees</span>
                    <span className="font-bold text-gray-800">324</span>
                  </div>
                </div>
              </div>

              {/* Category 4: Sales Activity */}
              <div className="bg-white border border-gray-250 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sales Activity</span>
                  <DollarSign className="w-4 h-4 text-[#ff6900]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Revenue Lift</span>
                    <span className="font-bold text-emerald-600">+18.5% lift</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Voucher Sales Vol</span>
                    <span className="font-bold text-gray-800">£1,240.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cashback Issued</span>
                    <span className="font-bold text-gray-800">£45.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart section */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-6">Daily Footfall: Customers vs. Passersby</h4>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                  />
                  <Tooltip 
                    contentStyle={{ background: '#213145', border: 'none', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                  />
                  {/* Passersby: soft grey */}
                  <Bar dataKey="passersby" name="Passersby (Local)" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  {/* Customers: terracotta accent */}
                  <Bar dataKey="customers" name="Customers (Entered)" fill="#ff6900" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Suggested Actions Split */}
          <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm">
            <div className="flex gap-2 items-center mb-6">
              <Lightbulb className="w-5 h-5 text-[#ff6900]" />
              <h3 className="text-base font-bold text-gray-900">Suggested Actions to Improve Metrics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedActions.map((action) => (
                <div key={action.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between items-start hover:border-orange-100 transition-all bg-[#fcf8f6]/10">
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-850 text-sm">{action.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <Link href={action.actionLink} className="mt-5 w-full">
                    <Button variant="outline" className="w-full text-xs font-bold border-orange-100 text-[#ff6900] hover:bg-[#fcf8f6] flex items-center justify-center gap-1.5 py-4 rounded-xl">
                      Get Started
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
