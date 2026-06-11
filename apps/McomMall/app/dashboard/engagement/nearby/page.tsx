'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  MapPin,
  Megaphone,
  Clock,
  TrendingUp,
  RotateCcw,
  Star,
  Sparkles,
} from 'lucide-react';

export default function NearbyCustomersPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1f1b18] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-orange-500/20 animate-fade-in-down">
          {toastMessage}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-5 pb-32 space-y-6">

        {/* ── BACK NAVIGATION ── */}
        <div className="flex items-center">
          <Link href="/dashboard/engagement" className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800">
            <ChevronLeft className="w-4 h-4" /> Back to Engagement
          </Link>
        </div>

        {/* ── TITLE BLOCK ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Nearby Customers</h2>
          <p className="text-xs text-gray-400">Target active customer interactions within proximity</p>
        </div>

        {/* ── HERO: LIVE PROXIMITY MAP ── */}
        <section className="relative h-[280px] rounded-xl overflow-hidden shadow-sm border border-[#f7ece7] bg-[#fcf1ec]/30 flex flex-col justify-between p-4">
          {/* Grayscale Map Background */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img 
              className="w-full h-full object-cover grayscale opacity-25" 
              alt="Urban Map District" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLuFzG6nV2mqv251E0S1lnS0pYgNqNUKsVuE6PO_kiRBmVbwpqFqLdnwN1V1mVU0KcqgSb463qfGXMSN2s99DE1ekXwkXsmXSfinIz1fangMGfQO0_R0vpLcTl6nzDQg4rxS8pZnShPLqlq9DX-JbMDqJz4a9IBnxCko39e6ffTjR1GcmO6cDi4CAH0onEcCDKVogWYvLaF_q5tvL1eWICms8sGg5G6EAL33DxktDxBJWscrvHYcjAwryQ" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>

          {/* Interactive Map Overlay Details */}
          <div className="relative z-10 flex justify-between items-start w-full">
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-[#f7ece7] max-w-[200px]">
              <h3 className="font-bold text-xs text-[#a14000]">Nearby Now</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">12 Customers within 500m</p>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fdf6f2] border border-orange-100 text-[#ea580c] rounded-full text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse"></span>
                  Live Feed
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => showToast("Flash Offer wizard opened")}
              className="bg-[#ea580c] hover:bg-[#a14000] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-white/10" />
              Flash Offer
            </button>
          </div>

          {/* Simulated User Pins */}
          {/* Sarah Pin (100m) */}
          <div className="absolute top-[45%] left-[32%] z-10">
            <div className="relative group cursor-pointer active:scale-90 transition-transform">
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#ea580c] shadow-md overflow-hidden ring-4 ring-[#ea580c]/15">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Sarah Avatar" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLvtLG-uAnoV5HaO6gv2Gs-5tarGwg-KE-Fq900EtdVk1nmbIxqo9GYChYt7FyOQCC2i0a-sWrMOd2CR-zdI0M3qAsYc9qTrUKbkcprtaWW9dhOHzbX2bUasN2wmkJzk2GKa5uxpXA-dZ0l9gNeE4-MIrrmN0M6Qp5qlXtFBzUZeVR7IvcNd-1TAzizaYJ6nVFC0msdTyc8MXq0P1w5tfkb8mSkI5ICNJXg94DrMkKWYdhtw5KHuY0m0C7k" 
                />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#1f1b18] text-white text-[8px] rounded-lg whitespace-nowrap opacity-100 transition-opacity">
                Sarah • 100m
              </div>
            </div>
          </div>

          {/* James Pin (250m) */}
          <div className="absolute bottom-[20%] right-[30%] z-10">
            <div className="relative group cursor-pointer active:scale-90 transition-transform">
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#a14000] shadow-md overflow-hidden ring-4 ring-orange-500/10">
                <img 
                  className="w-full h-full object-cover" 
                  alt="James Avatar" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuOG1avp1xBoKWXJ3JJfgIcwv6g_P2KkpusjB5NTZ_eVvY9eL7RNnKIN7ksCWHBTwb3xKSc6npFFnlK2kaE-_DWazYZIh8dEc3Uib5BEeR1aEaA6kLYnpRW9cQ0VEXHl-MlmobVPbfNByfc0_GarKZhOQVTmtevn5VaTQIOBYfZyJPKUJpPhLYNQ_tZ27PcBt8n8rxC5VbDLse5WpCkt2bdb2i5L47fqiFMpcQ3n7D3-cf0wpZ-eMDkgg" 
                />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#1f1b18] text-white text-[8px] rounded-lg whitespace-nowrap opacity-100 transition-opacity">
                James • 250m
              </div>
            </div>
          </div>
        </section>

        {/* ── ACTIVE PROXIMITY LIST ── */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-[#f7ece7] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-900">Active Proximity</h3>
            <button 
              onClick={() => showToast("Full proximity list loaded")}
              className="text-xs font-bold text-[#ea580c] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {/* Alex Rivera Card */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between p-3 bg-[#fff8f5] rounded-xl border border-[#f7ece7] gap-3 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-white" 
                    alt="Alex Rivera"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLuN7JqRCfjN9_oYzst1eftl00RlaxqrNCyJ6pIdr0habVFz6vnWdDy6Du2YkQVtKeT8hGYoLzekfZ5kHDI4oF4mPbF61csNYxQaAQV7Xlj14lNdhgj8L_glrl2mcwI88cpODV1okeVZR-pHnGadjCiGVI1W1g9sttskbryEYSnzSrLBqQTfliYtxzHcKcm_xbaf1pZBr-PCKNlt16K3pAL66kx0ycpo9KYQZQ_6-Y_aKC24L3FOicr8tg" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-900">Alex Rivera</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    100m away • Loyal Member
                  </p>
                </div>
              </div>
              <button 
                onClick={() => showToast("Promo offer campaign sent to Alex Rivera")}
                className="w-full xs:w-auto px-3.5 py-1.5 border border-[#e2bfb0] text-[#a14000] hover:bg-[#a14000] hover:text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 text-center bg-white"
              >
                Send Promo
              </button>
            </div>

            {/* David Chen Card */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between p-3 bg-[#fff8f5] rounded-xl border border-[#f7ece7] gap-3 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-white" 
                    alt="David Chen"
                    src="https://lh3.googleusercontent.com/aida/AP1WRLv6hrWOieyjXLknQUBsVHhmhnxlbYteiwdkRuRvboWqu1JVaqV2d-PMUs68flfmSidW1dw1Im5qA9pKBJNtNyWD0ui6lKTSyEl8k7h-1-r0MJcx3m4xNO9VRPabZ5MQahi4y1-QuddvY_0nK_ezGZpFMzNP1Yy4a8jxuqKXwb8LRrsu3D1Cmmn3Xt9Iaw5m5uZB-_9kh4iVcIFRSdnpClWEQfRnGOeRlQQk53FeNeodhCRfw9Rtye1HgA" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-900">David Chen</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    450m away • New Customer
                  </p>
                </div>
              </div>
              <button 
                onClick={() => showToast("Welcome offer sent to David Chen")}
                className="w-full xs:w-auto px-3.5 py-1.5 border border-[#e2bfb0] text-[#a14000] hover:bg-[#a14000] hover:text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 text-center bg-white"
              >
                Welcome Offer
              </button>
            </div>
          </div>
        </section>

        {/* ── METRICS & FLASH CAMPAIGNS BENTO ── */}
        <section className="grid grid-cols-1 gap-4">
          {/* Active Reach Card */}
          <div className="bg-[#a14000] text-white p-5 rounded-xl shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-200" />
                <h3 className="font-bold text-sm">Active Reach</h3>
              </div>
              <p className="text-xs text-orange-100 leading-relaxed">
                Your last blast offer reached 42 nearby users in 15 minutes.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-orange-200 uppercase font-semibold">Conversion rate</p>
                  <p className="text-2xl font-bold leading-none mt-1">12%</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Flash Sale Card */}
          <div className="bg-[#ea580c] text-white p-5 rounded-xl shadow-md flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm">Flash Sale</h3>
            <p className="text-xs text-orange-100 max-w-[200px]">Launch a 30-min local flash offer</p>
            <button 
              onClick={() => showToast("Flash sale campaign is now LIVE!")}
              className="w-full py-2.5 bg-[#1f1b18] hover:bg-black text-white rounded-full font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              Set Live
            </button>
          </div>
        </section>

        {/* ── RECENT RESPONSES TIMELINE ── */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-[#f7ece7] space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Recent Responses</h3>
          
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            {/* Timeline Item 1 */}
            <div className="relative">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white bg-[#ea580c]" />
              <div className="bg-[#fff8f5] rounded-xl p-3 border border-[#f7ece7]">
                <div className="flex justify-between items-baseline mb-1 gap-1 flex-wrap">
                  <span className="text-[10px] text-[#ea580c] uppercase font-black tracking-wide">Offer Redeemed</span>
                  <span className="text-[9px] text-gray-400">2m ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  <strong>Alex Rivera</strong> just walked in and redeemed &quot;Coffee 50% Off&quot;.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white bg-[#a14000]" />
              <div className="bg-[#fff8f5] rounded-xl p-3 border border-[#f7ece7]">
                <div className="flex justify-between items-baseline mb-1 gap-1 flex-wrap">
                  <span className="text-[10px] text-[#a14000] uppercase font-black tracking-wide">Promo Delivered</span>
                  <span className="text-[9px] text-gray-400">15m ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Broadcast &quot;Weekend Special&quot; sent to 12 customers nearby.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
