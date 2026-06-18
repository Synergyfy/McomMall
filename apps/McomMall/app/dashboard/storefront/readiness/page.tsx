'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Calendar, 
  Map, 
  Flame, 
  Sparkles, 
  Download, 
  Megaphone,
  TrendingUp,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contributor {
  rank: number;
  name: string;
  details: string;
  score: number;
  avatarUrl: string;
}

interface VitalityData {
  borough: string;
  readinessScore: number;
  weeklyGrowth: string;
  activeBusinesses: number;
  newBusinessesThisMonth: number;
  ongoingEventsCount: number;
  capacityPeakHour: string;
  activePromotionsCount: number;
  promoDiscountCode: string;
  topContributors: Contributor[];
}

export default function HighStreetReadiness() {
  const router = useRouter();
  const [offset, setOffset] = useState<number>(552.92); // Circle circumference: 2 * PI * 88

  // Fetch neighborhood vitality metrics from API
  const { data: metrics = null, isLoading } = useQuery<VitalityData>({
    queryKey: ['neighborhood-vitality'],
    queryFn: async () => {
      try {
        const res = await api.get('high-street/readiness', { params: { borough: 'Islington' } });
        return res.data;
      } catch {
        // Fallback mock stats matching High Street Readiness mockup
        return {
          borough: 'Islington',
          readinessScore: 82,
          weeklyGrowth: '+4% from last week',
          activeBusinesses: 142,
          newBusinessesThisMonth: 12,
          ongoingEventsCount: 8,
          capacityPeakHour: '18:00',
          activePromotionsCount: 24,
          promoDiscountCode: 'STREET24',
          topContributors: [
            {
              rank: 1,
              name: 'Artisan Bakery & Co',
              details: '3 promos • 2 events today',
              score: 98,
              avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaew2W5cf6IpIRuhQxuqLFXRRJq_SbpUi3M13rtS1LjvmSMuvkR8lXDWW1lSwM57dhOFuRoxEJVwBWkj0rMkT2lZikTOeu8-cCgQkz2-WLxr7tJItUyyxcYcI3NAtkyloD0dj2XUmkwf34QzmWNs-Jracc5Mb7owHpHNqtQ8ihmyLDlgf0OmJ5OoY3APS25jKzZYdPpT2sR-nntPcnbwN4ozvRxwiCMzG70jnjiyAEE4vFnPAjgtfycCVAqOVVNV4QoSS5_H17xNI',
            },
            {
              rank: 2,
              name: 'The Green Florist',
              details: '1 promo • Fully staffed',
              score: 94,
              avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ-epyNUGm53_AjeP5U9A8r5cET-Hoed6TbHK0I7ceiNXmGogYfb-zdpzei-YykmTEdjaw53jMkzLe2XcunOd4ynZfqUj0ImvXofeeIjFEi1GelLrxZxdEme7u4SUbBaE4mQKSXWUwUlniOx-ghNJTtdS85a2rqRtcNXdDvkYYsHTsRc3q6HHllxoeXRGGHDlF-FaiebxB07NpcxTuVLI_o6--BSSny5_UCQNwb3fl27K-xYG4A8I06AEQyX9w5wZgp5r2PjojaSM',
            },
            {
              rank: 3,
              name: 'Urban Threads',
              details: 'Flash sale active',
              score: 91,
              avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo-yF9sNAuxfEapQcQXfxTAtodf3_sHhxSXVhYP7ULveEWG0cXs_5J1EnMD8zGYWKXb4NxmgWPdUSr66wuXFoGGPIrE9PC6zgzGCdvo_Sd_7s62QGsVHI9NYPQUXl-CbeXfuo-KPEQxIsdWey3IZahQttlGx3oKHrfqc-Hk3l95oTTds_9o_xSwrUpBDtRC6RywsZkXE7nNo2WsVA8_Ot28SgsmIab3cZwJfnQEd-R8zWMvYVxx3tpGoA9Hhjp5_NBdOMtFHLPWOI',
            },
          ]
        };
      }
    }
  });

  // Animate readiness gauge circular offset on mount/load
  useEffect(() => {
    if (metrics) {
      const filledPercent = metrics.readinessScore / 100;
      const targetOffset = 552.92 * (1 - filledPercent);
      const timer = setTimeout(() => {
        setOffset(targetOffset);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#e2bfb0]/30 pb-6">
        <div>
          <span className="text-xs font-bold text-[#ff6900] uppercase tracking-wider block mb-1">Neighborhood Vitality</span>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">High Street Readiness</h1>
        </div>
        <div className="flex gap-2.5">
          <Button 
            onClick={() => window.print()}
            variant="outline" 
            className="border-[#a14000] text-[#a14000] hover:bg-orange-50/50 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/storefront/boroughs')}
            className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Megaphone className="w-4 h-4" />
            Launch Promotion
          </Button>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Readiness Score circular gauge */}
        <div className="lg:col-span-4 bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ff6900]" />
          <h3 className="font-bold text-sm text-[#5a4136] self-start uppercase tracking-wider mb-6">Readiness Score</h3>
          
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                className="text-gray-100" 
                cx="96" 
                cy="96" 
                r="88" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="12" 
              />
              <circle 
                className="text-[#ff6900] transition-all duration-1000 ease-out" 
                cx="96" 
                cy="96" 
                r="88" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="12" 
                strokeDasharray="552.92"
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold tracking-tight">{metrics?.readinessScore}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Live Status</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8f9ff] text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 text-xs font-bold shadow-inner">
            <TrendingUp className="w-4 h-4" />
            <span>{metrics?.weeklyGrowth}</span>
          </div>
        </div>

        {/* Dynamic statistics stack */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-50 text-[#ff6900] rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="bg-[#ff6900]/10 text-[#a14000] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                {metrics?.newBusinessesThisMonth} NEW
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#5a4136] uppercase tracking-wider mt-4">Active Businesses</p>
              <h4 className="text-4xl font-black">{metrics?.activeBusinesses}</h4>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-semibold">Storefront platform participants in borough</p>
          </div>

          <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-50 text-[#ff6900] rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#ff6900] uppercase animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#ff6900]" />
                Live Now
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#5a4136] uppercase tracking-wider mt-4">Ongoing Events</p>
              <h4 className="text-4xl font-black">0{metrics?.ongoingEventsCount}</h4>
            </div>
            <p className="text-[10px] text-[#5a4136] mt-2 font-semibold">Capacity peaking at {metrics?.capacityPeakHour}</p>
          </div>

          {/* Large Promotions Card */}
          <div className="sm:col-span-2 bg-[#213145] text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#ff6900]/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex-grow">
              <h4 className="text-lg font-black tracking-tight mb-1 text-white">Summer Jubilee Sales</h4>
              <p className="text-xs text-orange-200 max-w-sm">
                {metrics?.activePromotionsCount} businesses are currently running community-wide campaigns. Unified discount code &lsquo;{metrics?.promoDiscountCode}&rsquo; is active.
              </p>
            </div>
            <div className="relative z-10 text-center sm:text-right shrink-0 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <div className="text-2xl font-black text-orange-400">{metrics?.activePromotionsCount}</div>
              <div className="text-[9px] uppercase tracking-wider text-white/60 font-bold">Active Promotions</div>
            </div>
          </div>

        </div>
      </div>

      {/* Heatmap Snapshot & Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-[#0b1c30]">Neighborhood Heatmap</h3>
          </div>
          <div className="flex-grow relative bg-gray-50">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJr46JU56J7wfJOHTnQh1cfAWlEp-lolTnwyeD_-fAnnIyl0hHwjEIj2xH2WSZvimVoxVrQ9f5ctCEY3SF6Sql651F_pp3A839Cx2rhPkXfCdjdZD0MDDuLltkPN6WA8JK7HKoOg9RX1ANJOBTsNHbY8zynEmLMaOXZf5tdfmNgVo6ficvmehxtDwA9Ez8P2d2vVRjrdPwhEWgcUgk8HA5x7Y02228L9Rfkr4DCrGe52wo6SGy-sF8zh1xfgfXSvhq_vjAnl0w0J0" 
              alt="Heatmap details" 
              className="w-full h-full object-cover grayscale-[0.2]"
            />
            <div className="absolute top-1/4 left-1/3 p-3 bg-[#ff6900] text-white rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
              <Flame className="w-4 h-4 fill-white" />
              <span className="text-xs font-bold">Peak Hub</span>
            </div>
            <div className="absolute bottom-1/3 right-1/4 p-2 bg-white text-[#0b1c30] rounded-lg shadow-md flex items-center gap-1.5 border border-orange-100">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold">12 Shops Ready</span>
            </div>
          </div>
        </div>

        {/* Top Contributors Leaderboard */}
        <div className="lg:col-span-4 bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-black text-[#0b1c30] border-b border-gray-50 pb-3">Top Contributors</h3>
          <div className="space-y-4">
            {metrics?.topContributors.map((c) => (
              <div key={c.rank} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center font-bold text-sm text-[#a14000] overflow-hidden">
                    {c.rank === 1 ? '1' : c.rank === 2 ? '2' : '3'}
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-sm text-[#0b1c30] truncate">{c.name}</h4>
                  <p className="text-[10px] text-gray-500 font-semibold">{c.details}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-[#ff6900]">{c.score}%</span>
                  <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Ready</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
