'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Trophy, TrendingUp, Calendar, Users, Award, 
  ChevronLeft, ArrowLeft, ArrowUpRight, BarChart2,
  Clock, CheckCircle, Percent, Sparkles, Layers,
  Compass
} from 'lucide-react';
import api from '@/service/api';

interface CampaignData {
  id: string;
  title: string;
  gameType: string;
  rewardType: string;
  rewardValue: string;
  totalParticipants: number;
  gamesPlayed: number;
  rewardsIssued: number;
  rewardsClaimed: number;
  status: string;
}

export default function GamificationAnalytics() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id || id.startsWith('mock-')) {
        // Mock fallback details
        setCampaign({
          id: id || 'mock-1',
          title: id === 'mock-2' ? 'Secret Recipe Hunt' : 'Spin-to-Win Weekend',
          gameType: id === 'mock-2' ? 'qr-hunt' : 'spin-wheel',
          rewardType: id === 'mock-2' ? 'products' : 'discounts',
          rewardValue: id === 'mock-2' ? 'Free Cookie' : '20% off',
          totalParticipants: id === 'mock-2' ? 842 : 1248,
          gamesPlayed: id === 'mock-2' ? 980 : 1540,
          rewardsIssued: id === 'mock-2' ? 90 : 280,
          rewardsClaimed: id === 'mock-2' ? 84 : 245,
          status: 'active'
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(`/gamification/${id}`);
        setCampaign(response.data);
      } catch (err) {
        console.error('Error fetching campaign details for analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Derived metrics
  const displayMetrics = useMemo(() => {
    if (!campaign) return null;
    const convVal = (campaign.rewardsClaimed * 12.5) || 12480;
    const playAttempts = campaign.gamesPlayed ? (campaign.gamesPlayed / (campaign.totalParticipants || 1)).toFixed(1) : '4.2';
    const claimPercentage = campaign.rewardsIssued ? Math.round((campaign.rewardsClaimed / campaign.rewardsIssued) * 100) : 92;
    
    return {
      conversionsVal: convVal,
      attemptsRate: playAttempts,
      claimRate: claimPercentage
    };
  }, [campaign]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <p className="text-gray-400 font-bold text-sm animate-pulse">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 md:p-10 space-y-6 max-w-lg mx-auto pb-24">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <button 
          onClick={() => router.push('/dashboard/gamification')}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-all active:scale-95 duration-200"
        >
          <ChevronLeft size={16} />
          Back to Hub
        </button>
        <span className="text-[10px] font-black tracking-widest text-[#a14000] uppercase bg-[#ffdbcc] px-3 py-1 rounded-full">
          Analytics
        </span>
      </div>

      {/* Top title */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold font-title-md">{campaign?.title} Stats</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{campaign?.gameType} metric report</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full border flex items-center gap-1 text-[10px] font-bold text-slate-500 shadow-sm shrink-0">
          <Calendar size={12} className="text-primary" />
          <span>Last 30 Days</span>
        </div>
      </section>

      {/* KPI Conversion Value Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Conversions Impact</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-extrabold text-primary">${displayMetrics?.conversionsVal.toLocaleString()}</span>
              <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-0.5">
                <TrendingUp size={12} />
                14.2%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary border border-orange-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Chart representation */}
        <div className="h-28 flex items-end justify-between gap-1.5 mt-6 px-1">
          <div className="bg-primary/20 w-full rounded-t-lg transition-all duration-300 hover:bg-primary" style={{ height: '40%' }} title="Week 1" />
          <div className="bg-primary/30 w-full rounded-t-lg transition-all duration-300 hover:bg-primary" style={{ height: '55%' }} title="Week 2" />
          <div className="bg-primary/40 w-full rounded-t-lg transition-all duration-300 hover:bg-primary" style={{ height: '45%' }} title="Week 3" />
          <div className="bg-primary/50 w-full rounded-t-lg transition-all duration-300 hover:bg-primary" style={{ height: '70%' }} title="Week 4" />
          <div className="bg-primary/60 w-full rounded-t-lg transition-all duration-300 hover:bg-primary" style={{ height: '85%' }} title="Week 5" />
          <div className="bg-primary w-full rounded-t-lg transition-all duration-300 hover:bg-primary/90" style={{ height: '100%' }} title="Week 6" />
          <div className="bg-primary/70 w-full rounded-t-lg transition-all duration-300 hover:bg-primary" style={{ height: '60%' }} title="Week 7" />
        </div>
      </div>

      {/* Bento Grid metrics details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Circular Progress (Participation Rate) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Participation</span>
            <div className="text-xl font-extrabold text-[#0b1c30] mt-1">68.4%</div>
          </div>
          <div className="mt-4 flex items-center justify-center relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
              <path className="stroke-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="68.4, 100" strokeLinecap="round" strokeWidth="3" />
            </svg>
            <span className="absolute text-[8px] font-black text-primary tracking-widest uppercase">High</span>
          </div>
        </div>

        {/* Slider Progress (Repeat Plays) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Repeat Plays</span>
            <div className="text-xl font-extrabold text-[#0b1c30] mt-1">{displayMetrics?.attemptsRate}x</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '78%' }} />
            </div>
            <span className="text-[9px] text-[#ff6900] font-bold block">+12% vs last week</span>
          </div>
        </div>

        {/* Claim Efficiency */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 col-span-2 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reward Efficiency</span>
            <div className="text-base font-extrabold text-[#0b1c30] mt-1">{displayMetrics?.claimRate}% Claim Rate</div>
          </div>
          <div className="flex -space-x-2 shrink-0">
            <div className="w-9 h-9 rounded-full border-2 border-white bg-[#ffdbcc] flex items-center justify-center text-primary shadow-sm">
              <Trophy size={14} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-white bg-[#e5eeff] flex items-center justify-center text-blue-600 shadow-sm">
              <Compass size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends weekly lines representation */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Growth Trends</h3>
        <div className="h-32 flex items-end gap-3 px-2">
          {/* Mock Growth Weeks */}
          <div className="flex-1 relative flex items-end h-full group">
            <div className="absolute bottom-0 w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/25" style={{ height: '30%' }} />
            <div className="absolute bottom-0 w-full h-0.5 bg-primary" />
          </div>
          <div className="flex-1 relative flex items-end h-full group">
            <div className="absolute bottom-0 w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/25" style={{ height: '45%' }} />
            <div className="absolute bottom-0 w-full h-0.5 bg-primary" />
          </div>
          <div className="flex-1 relative flex items-end h-full group">
            <div className="absolute bottom-0 w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/25" style={{ height: '40%' }} />
            <div className="absolute bottom-0 w-full h-0.5 bg-primary" />
          </div>
          <div className="flex-1 relative flex items-end h-full group">
            <div className="absolute bottom-0 w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/25" style={{ height: '65%' }} />
            <div className="absolute bottom-0 w-full h-0.5 bg-primary" />
          </div>
          <div className="flex-1 relative flex items-end h-full group">
            <div className="absolute bottom-0 w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/25" style={{ height: '85%' }} />
            <div className="absolute bottom-0 w-full h-0.5 bg-primary" />
          </div>
          <div className="flex-1 relative flex items-end h-full group">
            <div className="absolute bottom-0 w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/25" style={{ height: '75%' }} />
            <div className="absolute bottom-0 w-full h-0.5 bg-primary" />
          </div>
        </div>
        <div className="flex justify-between mt-3 px-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
          <span>Week 1</span>
          <span>Week 3</span>
          <span>Week 6</span>
        </div>
      </section>

      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/gamification')}
        className="w-full py-4 bg-[#0b1c30] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all"
      >
        Return to Gamification Hub
      </button>
    </div>
  );
}
