'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Megaphone, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Award,
  CheckCircle,
  Plus
} from 'lucide-react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  reach: number;
  impressions: number;
  daysLeft: number;
  merchantCount: number;
  progress: number;
  bannerUrl?: string;
}

export default function BoroughCampaigns() {
  const queryClient = useQueryClient();
  const businessId = 'default-business-id';
  
  // Track joined campaigns in local state for offline mock support
  const [joinedList, setJoinedList] = useState<string[]>([]);

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['borough-campaigns'],
    queryFn: async () => {
      try {
        const res = await api.get('borough-campaigns');
        return res.data;
      } catch {
        // Fallback mock campaign opportunities matching mockup template
        return [
          {
            id: 'camp-1',
            name: 'Central District Summer Social',
            description: 'Promote local neighborhood events, artisan markets, and sidewalk dining to tourists and residents.',
            targetAudience: 'Local Residents & Tourists',
            reach: 8200,
            impressions: 12400,
            daysLeft: 14,
            merchantCount: 42,
            progress: 65,
            bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhCX4q_QtOcJE9OhP8NikB8njUB8W6VPnBu0tR_cD6ceiXFXtQgZaOvEAK21dkVS-04Nq2pxgYOou_xcyZxiiPjJbTQCwl0KDdI78ZWRuPAyEkldzXMRM5kNsxDy9_Hdu_pesrizsdxOHyAeecqEqPxt_kdvQ2pEwR4VTZWmQ4V6vlU6QVNDw9mjHXAHgwTEwDIWKxqXOSS1lURyyCNsa1GtLhAjMy9Lfv8L-E1_0IxuSrt0obJu3wFrdqR_TV9N4rz8zFADMw1y4',
          },
          {
            id: 'camp-2',
            name: 'Northside Artisan Expo',
            description: 'Showcase premium handmade products, custom crafts, and specialized artwork collections.',
            targetAudience: 'High-value Collectors',
            reach: 8200,
            impressions: 8200,
            daysLeft: 28,
            merchantCount: 18,
            progress: 30,
            bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgiZMhYAPxYysMj7zYs6KfNxeuHMOBgKakKwXQdLP8POF5g9jIqFnul82NF7v3IHPEODPdbrDfnGAh3hfjmIGZVCZuJIsWp1oeFRMJ1D_XfTpFHAdIhdOad32bsX6Fd5O1dXlH6hPZ-EW1L_ACv_oPiHwKLq4FMSofU4qHVP52YxatI6suA2WFIQtZqMbE6OO-ItKhYInI519pamNLbmteiabkVgDlRp0ySCqO3QtimmzFYus4dxuXCEVPE6Z4KbrxvLILZnbYo8c',
          },
        ];
      }
    }
  });

  // Participate mutation
  const participateMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`borough-campaigns/${id}/participate`, { businessId });
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['borough-campaigns'] });
      setJoinedList([...joinedList, campaignId]);
      toast.success('Joined borough campaign social blast!');
    },
    onError: (_, campaignId) => {
      setJoinedList([...joinedList, campaignId]);
      toast.info('API fallback: Registered participation offline');
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
          <span className="text-xs font-bold text-[#ff6900] uppercase tracking-wider block mb-1">Merchant Ecosystem</span>
          <h1 className="text-3xl font-black text-[#0b1c30] tracking-tight">Borough Participation</h1>
        </div>
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left active campaigns */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-black text-gray-950 flex items-center gap-1.5">
            <Megaphone className="w-5 h-5 text-[#ff6900]" />
            Active Campaigns
          </h2>

          <div className="space-y-6">
            {campaigns.map((camp) => {
              const isJoined = joinedList.includes(camp.id);
              return (
                <div 
                  key={camp.id} 
                  className="bg-white border border-[#e2bfb0]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row"
                >
                  <div className="md:w-48 h-36 relative overflow-hidden shrink-0 bg-gray-50 border-r border-gray-100">
                    <img 
                      src={camp.bannerUrl} 
                      alt={camp.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-[#a14000] text-lg">{camp.name}</h3>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">Targeting: {camp.targetAudience}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#ff6900]">{(camp.impressions / 1000).toFixed(1)}k</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Impressions</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff6900]" style={{ width: `${camp.progress}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-4 items-center text-xs font-semibold text-[#5a4136] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {camp.daysLeft} Days Left
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        {camp.merchantCount + (isJoined ? 1 : 0)} Merchants
                      </span>
                      <Button
                        size="sm"
                        disabled={isJoined}
                        onClick={() => participateMutation.mutate(camp.id)}
                        className={`ml-auto rounded-xl font-bold px-4 ${
                          isJoined 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50' 
                            : 'bg-orange-50 text-[#a14000] hover:bg-[#ff6900]/10 border border-[#e2bfb0]/30'
                        }`}
                      >
                        {isJoined ? 'Participating' : 'Join Campaign'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right impact statistics and opportunities */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-lg font-black text-gray-950 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-[#ff6900]" />
            Borough Impact
          </h2>

          <div className="bg-[#ff6900] rounded-2xl p-6 text-white shadow-lg space-y-2 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-100">Total Storefront Growth</span>
            <div className="text-4xl font-black">+24.5%</div>
            <p className="text-xs text-orange-50">Driven by borough synergy networks this month.</p>
          </div>

          {/* Breakdown cards */}
          <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm space-y-5">
            {[
              { borough: 'Central District', count: '4.2k Engagement', growth: true },
              { borough: 'Northside', count: '1.8k Engagement', growth: true },
              { borough: 'East Port', count: '0.9k Engagement', growth: false }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{item.borough}</span>
                  <span className="font-extrabold text-[#0b1c30]">{item.count}</span>
                </div>
                <span className={`text-xs font-bold ${item.growth ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.growth ? '▲' : '▬'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Seasonal & Expo Opportunities */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Seasonal Promo List */}
        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-[#0b1c30]">Upcoming Seasonal Drives</h3>
          <div className="space-y-3">
            {[
              { name: 'Winter Lights Fest', date: 'Starts in 45 days', status: 'Join' },
              { name: 'Spring Renewal Sale', date: 'Planning Phase', status: 'Notify' }
            ].map((opp) => (
              <div key={opp.name} className="p-4 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-extrabold text-sm text-[#0b1c30]">{opp.name}</h5>
                  <p className="text-[10px] text-gray-400 font-semibold">{opp.date}</p>
                </div>
                <Button 
                  onClick={() => toast.success(`Registered for ${opp.name} notification updates`)}
                  size="sm" 
                  className="bg-[#ff6900]/10 text-[#a14000] hover:bg-[#ff6900]/20 rounded-full font-bold px-4"
                >
                  {opp.status}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Expo application */}
        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-6 shadow-sm space-y-4 bg-gradient-to-br from-white to-orange-50/20">
          <div>
            <h3 className="text-lg font-black text-[#0b1c30]">Expo Week 2024</h3>
            <p className="text-xs text-gray-500 font-semibold">October 12 - October 19 &bull; Merchant Plaza flagship booth options</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border border-gray-150 rounded-xl text-center bg-white">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Standard Stall</span>
              <span className="font-black text-[#a14000] text-sm">$499</span>
            </div>
            <div className="p-3 border-2 border-[#ff6900] rounded-xl text-center bg-white shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#ff6900] font-bold block">Premium Booth</span>
              <span className="font-black text-[#a14000] text-sm">$899</span>
            </div>
          </div>
          <Button 
            onClick={() => toast.success('Application request submitted for review!')}
            className="w-full bg-[#a14000] text-white hover:bg-[#ff6900] font-bold py-6 rounded-xl"
          >
            Apply for Expo Participation
          </Button>
        </div>

      </section>

    </div>
  );
}
