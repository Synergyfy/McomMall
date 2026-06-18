'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Signal, 
  Map, 
  Users, 
  TrendingUp, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignalMetrics {
  totalViews: number;
  totalVotes: number;
  progressPercent: number;
  targetGoal: number;
  sentimentScore: number;
  topCategories: { category: string; votes: number }[];
  recentVoters: { id: string; signalType: string; createdAt: string }[];
}

export default function InterestSignalsDashboard() {
  const router = useRouter();
  const businessId = 'default-business-id';

  // Fetch signals metrics from API
  const { data: metrics = null, isLoading } = useQuery<SignalMetrics>({
    queryKey: ['interest-signals', businessId],
    queryFn: async () => {
      try {
        const res = await api.get(`interest-signals/${businessId}`);
        return res.data;
      } catch {
        // Fallback mock statistics matching Interest Signals Mockup
        return {
          totalViews: 4852,
          totalVotes: 42,
          progressPercent: 42,
          targetGoal: 100,
          sentimentScore: 94,
          topCategories: [
            { category: 'Sourdough Bread', votes: 24 },
            { category: 'Kids Workshops', votes: 12 },
            { category: 'Vegan Cakes', votes: 6 }
          ],
          recentVoters: [
            { id: 'v-1', signalType: 'Sourdough Bread', createdAt: new Date().toISOString() },
            { id: 'v-2', signalType: 'Kids Workshops', createdAt: new Date().toISOString() },
            { id: 'v-3', signalType: 'Sourdough Bread', createdAt: new Date().toISOString() }
          ]
        };
      }
    }
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e2bfb0]/30 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#a14000] tracking-tight">Interest Signal Dashboard</h1>
          <p className="text-sm text-[#5a4136]">Track neighborhood consumer demand signals on unclaimed storefront listings.</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/storefront/activations')}
          className="bg-[#ff6900] text-white hover:bg-[#a14000] font-bold px-5 py-6 rounded-xl flex items-center gap-2 shadow-md transition-colors"
        >
          <Building2 className="w-5 h-5" />
          Claim Storefront Listing
        </Button>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">Neighborhood Views</span>
            <Users className="w-4 h-4 text-[#ff6900]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{metrics?.totalViews.toLocaleString()}</div>
            <p className="text-[11px] text-[#5a4136] mt-1">Unique visitor impressions</p>
          </CardContent>
        </Card>

        <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">Demand Pledges</span>
            <Signal className="w-4 h-4 text-[#ff6900]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{metrics?.totalVotes}</div>
            <p className="text-[11px] text-green-600 mt-1 font-semibold">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">Activation Goal</span>
            <TrendingUp className="w-4 h-4 text-[#ff6900]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{metrics?.progressPercent}%</div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#ff6900]" style={{ width: `${metrics?.progressPercent}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Goal: {metrics?.targetGoal} votes to auto-notify</p>
          </CardContent>
        </Card>

        <Card className="border border-[#e2bfb0]/30 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-[#5a4136] uppercase tracking-wider">Sentiment Index</span>
            <Award className="w-4 h-4 text-[#ff6900]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{metrics?.sentimentScore}%</div>
            <p className="text-[11px] text-[#5a4136] mt-1">Positive community support</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Snapshot & Category Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap Snapshot */}
        <div className="lg:col-span-8 bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-[#0b1c30] flex items-center gap-1.5">
              <Map className="w-5 h-5 text-[#ff6900]" />
              Neighborhood Demand Hotspots
            </h3>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Hot Zone
            </span>
          </div>

          <div className="h-72 relative bg-gray-100 overflow-hidden flex items-center justify-center">
            {/* Mock Map Image */}
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJr46JU56J7wfJOHTnQh1cfAWlEp-lolTnwyeD_-fAnnIyl0hHwjEIj2xH2WSZvimVoxVrQ9f5ctCEY3SF6Sql651F_pp3A839Cx2rhPkXfCdjdZD0MDDuLltkPN6WA8JK7HKoOg9RX1ANJOBTsNHbY8zynEmLMaOXZf5tdfmNgVo6ficvmehxtDwA9Ez8P2d2vVRjrdPwhEWgcUgk8HA5x7Y02228L9Rfkr4DCrGe52wo6SGy-sF8zh1xfgfXSvhq_vjAnl0w0J0" 
              alt="Map snapshot" 
              className="w-full h-full object-cover grayscale-[0.2]"
            />
            {/* Map Pins overlay */}
            <div className="absolute top-1/4 left-1/3 p-3 bg-[#ff6900] text-white rounded-xl shadow-xl flex items-center gap-2 animate-bounce cursor-pointer">
              <Flame className="w-4 h-4 fill-white" />
              <span className="text-xs font-bold">Peak Hub</span>
            </div>
            <div className="absolute bottom-1/3 right-1/4 p-2 bg-white text-on-surface rounded-lg shadow-md flex items-center gap-1.5 border border-orange-100">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold">12 Registered Voters</span>
            </div>
          </div>
        </div>

        {/* Top Requested Categories */}
        <div className="lg:col-span-4 bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-black text-[#0b1c30] mb-6 border-b border-gray-50 pb-3">Top Wanted Offerings</h3>
          <div className="space-y-5">
            {metrics?.topCategories.map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#a14000] font-black flex items-center justify-center text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-sm text-[#0b1c30]">{cat.category}</div>
                  <div className="text-xs text-gray-500">{cat.votes} resident pledges</div>
                </div>
                <span className="text-xs font-bold text-[#ff6900] bg-orange-50 px-2.5 py-0.5 rounded-full">
                  {Math.round((cat.votes / (metrics?.totalVotes || 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Requests Card Section */}
      <div className="bg-[#fcf8f6] border border-[#e2bfb0]/35 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <h3 className="text-xl font-black text-[#a14000]">Are you the listing owner?</h3>
          <p className="text-sm text-[#5a4136] leading-relaxed">
            Verify ownership of this listing to claim accumulated customer interest votes, unlock storefront dashboard stats, and start engaging with the local community.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/storefront/activations')} 
          className="bg-[#a14000] text-white hover:bg-[#ff6900] font-bold rounded-xl px-6 py-5 flex items-center gap-1"
        >
          Claim Storefront
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}
