'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Download,
  Ticket,
  Percent,
  TrendingUp,
  QrCode,
  Mail,
  MapPin,
  Share2,
  Info,
  Sparkles,
  ArrowLeftCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

import { useGetVoucherProduct } from '@/service/hooks/useVoucherService';

export default function VoucherCampaignAnalytics() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { voucherProduct, isLoading, isError } = useGetVoucherProduct(id as string);

  const mockProduct = {
    id: 'mock-vp-1',
    name: 'Summer Flash Sale',
    value: 20,
    valueType: 'percentage'
  };

  const product = voucherProduct || mockProduct;

  // Render chart bar animation state
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    setAnimated(true);
  }, []);

  const handleExport = () => {
    toast.success('Attribution report exported successfully!');
  };

  if (isLoading && !id?.toString().startsWith('mock-')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-slate-600">Loading campaign analytics...</span>
      </div>
    );
  }

  // Pre-configured dynamic heights for 30 bars (representing 30 days)
  const barHeights = [
    40, 55, 35, 70, 60, 85, 45, 50, 30, 95, 
    65, 40, 55, 80, 25, 60, 75, 45, 90, 55, 
    35, 70, 100, 80, 65, 45, 50, 30, 75, 85
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 md:p-10 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top controls */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
        <button
          onClick={() => router.push('/dashboard/vouchers')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-all active:scale-95"
        >
          <ArrowLeftCircle size={18} />
          Back to Dashboard
        </button>
      </div>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">Voucher Analytics</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
            Performance: {product.name} ({product.valueType === 'percentage' ? `${product.value}% OFF` : `$${product.value} OFF`})
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[#0b1c30] font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-primary-container text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 rounded-xl"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Redemptions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#ffdbcc] text-primary rounded-xl">
              <Ticket size={20} />
            </div>
            <span className="bg-green-50 text-green-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
              +12.5%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Redemptions</span>
            <div className="text-3xl font-black text-[#0b1c30] mt-1 font-stat-lg">1,284</div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Usage Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
              <Percent size={20} />
            </div>
            <span className="bg-slate-50 text-slate-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
              Stable
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Usage Rate</span>
            <div className="text-3xl font-black text-[#0b1c30] mt-1 font-stat-lg">64.2%</div>
          </div>
          <div className="mt-4 flex gap-1.5">
            <div className="h-1.5 flex-1 bg-primary rounded-full" />
            <div className="h-1.5 flex-1 bg-primary rounded-full" />
            <div className="h-1.5 flex-1 bg-primary/20 rounded-full" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#ffdbcc] text-primary rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="bg-green-50 text-green-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
              +$2.4k
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Revenue</span>
            <div className="text-3xl font-black text-[#0b1c30] mt-1 font-stat-lg">$12,450</div>
          </div>
          <p className="text-[9px] text-gray-400 font-semibold italic mt-4">Attributed sales only</p>
        </div>

        {/* QR Scans */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
              <QrCode size={20} />
            </div>
            <span className="bg-red-50 text-red-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
              -2%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">QR Scans</span>
            <div className="text-3xl font-black text-[#0b1c30] mt-1 font-stat-lg">3,902</div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-slate-400" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-[#0b1c30] uppercase tracking-wide">Redemption Trends</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-[10px] text-gray-400 font-bold uppercase">This Month</span>
            </div>
          </div>
          
          <div className="h-60 w-full flex items-end justify-between gap-1 mt-8">
            {barHeights.map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-primary/20 hover:bg-primary rounded-t-sm transition-all duration-300 relative group cursor-pointer"
                style={{ height: animated ? `${h}%` : '0%' }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#213145] text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-20">
                  Day {i + 1}: {Math.floor(h * 1.5)} redemptions
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Channels Attribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#0b1c30] uppercase tracking-wide mb-6">Attribution Channels</h3>
            
            <div className="space-y-6">
              {/* Channel 1 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-[#0b1c30] mb-1">
                    <span>Email Newsletter</span>
                    <span>42%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>

              {/* Channel 2 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-[#0b1c30] mb-1">
                    <span>Borough Campaign</span>
                    <span>28%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '28%' }} />
                  </div>
                </div>
              </div>

              {/* Channel 3 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Share2 size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-[#0b1c30] mb-1">
                    <span>Social Media</span>
                    <span>15%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

              {/* Channel 4 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                  <QrCode size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-[#0b1c30] mb-1">
                    <span>In-Store QR</span>
                    <span>10%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full text-center py-3 text-primary font-bold text-xs border-t border-slate-100 hover:bg-slate-50 transition-colors mt-6">
            View Attribution Breakdown
          </button>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-[#0b1c30] text-sm mb-1">Campaign Impact</h4>
            <p className="text-xs text-[#5a4136] leading-relaxed mt-2">
              Your recent "{product.name}" drive increased weekly customer footfall across your region by 18%.
            </p>
          </div>
          <button className="px-6 py-2.5 mt-6 border border-primary text-primary font-bold text-xs rounded-full hover:bg-primary/5 active:scale-95 transition-all w-fit">
            Analyze Campaign Segment
          </button>
        </div>

        <div className="bg-primary-container text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h4 className="font-extrabold text-sm text-white mb-1">Optimization Tip</h4>
            <p className="text-xs text-white/90 leading-relaxed mt-2">
              Vouchers shared on Tuesday mornings have a 40% higher redemption rate. Consider scheduling your next batch for July 18th.
            </p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/vouchers/new')}
            className="px-6 py-2.5 mt-6 bg-white text-primary font-bold text-xs rounded-full hover:bg-opacity-90 active:scale-95 transition-all w-fit shadow-md relative z-10"
          >
            Schedule New Campaign
          </button>
          <div className="absolute -right-6 -bottom-6 opacity-10 transform rotate-12">
            <Lightbulb size={120} />
          </div>
        </div>
      </div>

    </div>
  );
}
