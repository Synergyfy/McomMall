'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Coins,
  ShoppingBag,
  TrendingUp,
  Plus,
  Pencil,
  PauseCircle,
  PlusCircle,
  Megaphone,
  Check,
  Gift,
  UserPlus,
  Users,
  BarChart2,
  Send,
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit2,
  Copy,
  Rocket,
  Trash2,
  Zap,
} from 'lucide-react';
import { useGetPromotions, useDeletePromotion } from '@/service/promotions/hook';
import { toast } from 'sonner';

// ─── STATIC DATA FOR REWARD CAMPAIGNS TAB ────────────────────────────────────
const categoryColors: Record<string, string> = {
  Gamification: 'bg-orange-50 text-[#a14000]',
  Referral: 'bg-blue-50 text-[#00629f]',
  'Borough-specific': 'bg-purple-50 text-purple-700',
  MULTIPLIER: 'bg-orange-50 text-[#a14000]',
  BONUS_POINTS: 'bg-blue-50 text-[#00629f]',
};

const barHeights = [40, 60, 45, 85, 70, 95, 50];
const barDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const staticCampaigns = [
  {
    id: 'static-1',
    title: 'Spring Collection Quest',
    description: 'Reward customers for visiting 3 different departments in one trip.',
    badge: 'Gamification',
    stats: { label1: 'Participants', val1: '642', label2: 'Conversion', val2: '18%' },
    actions: ['edit', 'pause', 'boost'],
  },
  {
    id: 'static-2',
    title: 'Neighborhood Network',
    description: 'Get 20% off when you refer a neighbor within 1 mile of the store.',
    badge: 'Referral',
    stats: { label1: 'Invites Sent', val1: '1.2k', label2: 'Revenue Gen', val2: '$4.2k' },
    actions: ['edit', 'duplicate', 'boost'],
  },
  {
    id: 'static-3',
    title: 'Brooklyn Locals Day',
    description: 'Flash rewards for shoppers with 112xx zip codes during morning hours.',
    badge: 'Borough-specific',
    stats: { label1: 'Redeemed', val1: '245', label2: 'Satisfied', val2: '92%' },
    actions: ['edit', 'pause', 'boosted'],
  },
];

const topPerforming = [
  { name: 'Flash Sales', growth: '+12%', color: 'bg-[#a14000]' },
  { name: 'New Member Bonus', growth: '+8%', color: 'bg-[#00629f]' },
  { name: 'Review Rewards', growth: '+5%', color: 'bg-purple-500' },
];

// ─── STATIC DATA FOR OVERVIEW TAB ───────────────────────────────────────────
const members = [
  { initials: 'ES', name: 'Emma Stone',   tier: 'Platinum', pts: '12,450', spent: '£2,100', bg: 'bg-purple-100',  color: 'text-purple-700', barW: '100%', barColor: '#9333ea' },
  { initials: 'JD', name: 'John Doe',     tier: 'Gold',     pts: '8,230',  spent: '£743',   bg: 'bg-amber-100',  color: 'text-amber-700',  barW: '66%',  barColor: '#f59e0b' },
  { initials: 'LM', name: 'Lisa Miller',  tier: 'Gold',     pts: '7,900',  spent: '£690',   bg: 'bg-amber-100',  color: 'text-amber-700',  barW: '63%',  barColor: '#f59e0b' },
  { initials: 'AR', name: 'Alex Rivera',  tier: 'Silver',   pts: '3,400',  spent: '£312',   bg: 'bg-slate-100',  color: 'text-slate-600',  barW: '27%',  barColor: '#64748b' },
  { initials: 'MG', name: 'Maria Gomez',  tier: 'Silver',   pts: '2,900',  spent: '£240',   bg: 'bg-slate-100',  color: 'text-slate-600',  barW: '23%',  barColor: '#64748b' },
  { initials: 'TK', name: 'Thomas K.',    tier: 'Bronze',   pts: '890',    spent: '£156',   bg: 'bg-orange-50',  color: 'text-orange-600', barW: '7%',   barColor: '#ea580c' },
];

const tierColors: Record<string, string> = {
  Platinum: '#9333ea',
  Gold:     '#f59e0b',
  Silver:   '#64748b',
  Bronze:   '#ea580c',
};

const promotionsList = [
  { title: '10% off next visit', type: 'Discount',  used: 34, total: 50, icon: Gift },
  { title: 'Double Points Day',  type: 'Multiplier', used: 89, total: 100, icon: Zap },
  { title: 'Birthday Reward',    type: 'Reward',     used: 12, total: 20,  icon: Star },
];

export default function EngagementLoyaltyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: promotions, refetch } = useGetPromotions();
  const deletePromotion = useDeletePromotion();

  // Handle Tab Selection via URL State
  const initialTab = searchParams.get('tab') === 'campaigns' ? 'campaigns' : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'campaigns') {
      setActiveTab('campaigns');
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);

  // Statistics cards data for Overview
  const statsOverview = [
    {
      title: 'Active Rewards',
      value: '24',
      change: '+12%',
      isPositive: true,
      color: 'border-l-4 border-[#a14000]',
      iconBg: 'bg-[#ffdbcc]/40',
      iconColor: 'text-[#a14000]',
      icon: Star,
    },
    {
      title: 'Points Issued',
      value: '142.8k',
      change: '+5.2k',
      isPositive: true,
      color: '',
      iconBg: 'bg-[#f7ece7]',
      iconColor: 'text-[#a14000]',
      icon: Coins,
    },
    {
      title: 'Redemption Rate',
      value: '68.4%',
      change: '-2%',
      isPositive: false,
      color: '',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: ShoppingBag,
    },
    {
      title: 'Program Growth',
      value: '2.4k',
      change: '+18%',
      isPositive: true,
      color: '',
      iconBg: 'bg-[#fff1eb]',
      iconColor: 'text-[#ea580c]',
      icon: TrendingUp,
    },
  ];

  // Dynamic campaigns combining backend and mock data
  const displayCampaigns = useMemo(() => {
    if (promotions && promotions.length > 0) {
      return promotions.map((p) => ({
        id: p.id,
        title: p.name,
        description: p.description ?? 'No description provided.',
        badge: p.promotionType === 'MULTIPLIER' ? 'Gamification' : 'Referral',
        stats: {
          label1: p.isActive ? 'Active' : 'Inactive',
          val1: p.promotionType === 'MULTIPLIER' ? 'Multiplier' : 'Bonus',
          label2: 'Status',
          val2: p.isActive ? '✓ Live' : 'Paused',
        },
        actions: ['edit', 'pause', 'boost'],
        isReal: true,
      }));
    }
    return staticCampaigns;
  }, [promotions]);

  const activeCampaignsCount = promotions?.filter(p => p.isActive).length ?? 0;

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion.mutateAsync(id);
      toast.success('Campaign deleted successfully!');
      refetch();
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      
      {/* ── BACK BUTTON ── */}
      <div className="max-w-md lg:max-w-7xl mx-auto px-4 pt-5">
        <Link
          href="/dashboard/engagement"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Engagement
        </Link>
      </div>

      <div className="max-w-md lg:max-w-7xl mx-auto px-4 pt-2 pb-36 space-y-6">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e2bfb0]/20 pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {activeTab === 'overview' ? 'Loyalty Dashboard' : 'Reward Campaigns'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === 'overview' 
                ? 'Manage customer incentives and track point distributions.' 
                : 'Drive customer loyalty through targeted proximity marketing.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'overview' ? (
              <Link
                href="/dashboard/loyalty/rules/create"
                className="bg-[#a14000] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Create Reward Rule
              </Link>
            ) : (
              <Link
                href="/dashboard/promotions/new"
                className="bg-[#a14000] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> New Campaign
              </Link>
            )}
          </div>
        </div>

        {/* ── SUB TAB BAR ── */}
        <div className="flex border-b border-[#e2bfb0]/20 gap-6">
          <button
            onClick={() => {
              setActiveTab('overview');
              router.push('/dashboard/engagement/loyalty?tab=overview');
            }}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'overview'
                ? 'text-[#ea580c]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div
                layoutId="loyaltySubTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ea580c] rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('campaigns');
              router.push('/dashboard/engagement/loyalty?tab=campaigns');
            }}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'campaigns'
                ? 'text-[#ea580c]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Reward Campaigns
            {activeTab === 'campaigns' && (
              <motion.div
                layoutId="loyaltySubTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ea580c] rounded-full"
              />
            )}
          </button>
        </div>

        {/* ── TAB CONTENT RENDER ── */}
        {activeTab === 'overview' ? (
          /* ==================== OVERVIEW TAB ==================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Tier Breakdown & Goal */}
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {statsOverview.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.title}
                      whileHover={{ y: -2 }}
                      className={`bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgba(161,64,0,0.02)] border border-[#f7ece7] flex flex-col justify-between ${stat.color}`}
                      style={{ minHeight: '120px' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-9 h-9 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          stat.isPositive ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] font-semibold text-gray-400">{stat.title}</p>
                        <h3 className="text-xl font-black text-gray-950 mt-0.5">{stat.value}</h3>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tier Breakdown */}
              <div className="rounded-2xl p-5 bg-white space-y-4 border border-[#f7ece7] shadow-[0_2px_8px_rgba(161,64,0,0.06)]">
                <h3 className="text-sm font-extrabold text-[#1f1b18]">Tier Breakdown</h3>
                <div className="space-y-3.5">
                  {[
                    { tier: 'Platinum', count: 48,  pct: '4%',   color: '#9333ea' },
                    { tier: 'Gold',     count: 202, pct: '17%',  color: '#f59e0b' },
                    { tier: 'Silver',   count: 450, pct: '38%',  color: '#64748b' },
                    { tier: 'Bronze',   count: 500, pct: '41%',  color: '#ea580c' },
                  ].map((t) => (
                    <div key={t.tier} className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5" style={{ color: t.color }} />
                          <span style={{ color: '#1f1b18' }}>{t.tier}</span>
                        </span>
                        <span className="text-xs font-medium" style={{ color: '#8e7164' }}>{t.count} · {t.pct}</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: '#f7ece7' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: t.pct, background: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal Progress */}
              <div className="rounded-2xl p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(234,88,12,0.2)]"
                style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
                <div className="relative z-10 space-y-2">
                  <p className="text-orange-100 text-xs font-semibold">Monthly Goal</p>
                  <div className="flex items-end justify-between">
                    <p className="text-white font-bold">2,500 Members</p>
                    <p className="text-white text-2xl font-black">88%</p>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <div className="h-full rounded-full" style={{ width: '88%', background: '#ffb694' }} />
                  </div>
                  <p className="text-xs text-orange-100 font-medium">300 members away. Keep it up!</p>
                </div>
              </div>
            </div>

            {/* Column 2: Top Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 px-1">
                <h3 className="text-sm font-extrabold text-[#1f1b18]">Top Members</h3>
                <Link href="/dashboard/loyalty/members" className="text-xs font-bold text-[#ea580c] hover:underline">Manage all</Link>
              </div>
              
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#f7ece7] shadow-[0_2px_6px_rgba(161,64,0,0.03)] hover:border-orange-500/10 transition-colors">
                    <span className="text-xs font-black w-4 shrink-0 text-center text-[#e2bfb0]">#{i + 1}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.bg} ${m.color}`}>
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate text-[#1f1b18]">{m.name}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${tierColors[m.tier]}15`, color: tierColors[m.tier] }}>
                          {m.tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f7ece7' }}>
                          <div className="h-full rounded-full" style={{ width: m.barW, background: m.barColor }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold shrink-0">{m.pts} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Active Promotions Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-extrabold text-[#1f1b18]">Active Promotions</h3>
                <Link href="/dashboard/promotions" className="text-xs font-bold text-[#ea580c] hover:underline">See all</Link>
              </div>
              
              <div className="space-y-3">
                {promotionsList.map((p) => {
                  const Icon = p.icon;
                  const pct = Math.round((p.used / p.total) * 100);
                  return (
                    <div key={p.title} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#f7ece7] shadow-[0_2px_6px_rgba(161,64,0,0.03)] hover:border-orange-500/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1f1b18]">{p.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f7ece7' }}>
                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold shrink-0">{p.used}/{p.total}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 text-[#e2bfb0]" />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* ==================== REWARD CAMPAIGNS TAB ==================== */
          <div className="space-y-6">
            
            {/* Bento Global metrics grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Avg. Participation', value: '84%', icon: BarChart2, bg: 'bg-orange-50', color: 'text-[#a14000]' },
                { label: 'Program ROI', value: '3.2x', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-[#00629f]' },
                { label: 'New Referrals', value: '1.4k', icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
                { label: 'Active Boosts', value: String(activeCampaignsCount || 12), icon: Zap, bg: 'bg-red-50', color: 'text-red-600' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="bg-white p-4 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3"
                  >
                    <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className={`font-black text-xl ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* Split layout: Campaigns List vs. Charts & Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active campaigns list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-base text-gray-900 px-1">Active Campaigns</h3>
                
                <div className="space-y-4">
                  {displayCampaigns.map((camp) => (
                    <motion.div
                      key={camp.id}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.03)] overflow-hidden relative"
                    >
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${categoryColors[camp.badge] ?? 'bg-gray-100 text-gray-500'}`}>
                          {camp.badge}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 pr-20">{camp.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{camp.description}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-black text-sm text-gray-800">{camp.stats.val1}</p>
                            <p className="text-[9px] text-gray-400 font-semibold">{camp.stats.label1}</p>
                          </div>
                          <div className="w-px h-8 bg-[#f7ece7]" />
                          <div>
                            <p className="font-black text-sm text-gray-800">{camp.stats.val2}</p>
                            <p className="text-[9px] text-gray-400 font-semibold">{camp.stats.label2}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {camp.actions.includes('edit') && (
                            <button
                              onClick={() => router.push(`/dashboard/promotions/edit/${camp.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2bfb0] text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:scale-95 transition-all"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}
                          {camp.actions.includes('pause') && (
                            <button
                              onClick={() => toast.success(`Campaign "${camp.title}" paused`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2bfb0] text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:scale-95 transition-all"
                            >
                              <PauseCircle className="w-3 h-3" /> Pause
                            </button>
                          )}
                          {camp.actions.includes('duplicate') && (
                            <button
                              onClick={() => toast.success(`Campaign "${camp.title}" duplicated`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2bfb0] text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:scale-95 transition-all"
                            >
                              <Copy className="w-3 h-3" /> Duplicate
                            </button>
                          )}
                          {camp.actions.includes('boost') && (
                            <button
                              onClick={() => toast.success(`Boost activated for "${camp.title}"!`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff6900] text-white text-[10px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                            >
                              <Rocket className="w-3 h-3" /> Boost
                            </button>
                          )}
                          {camp.actions.includes('boosted') && (
                            <button
                              disabled
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-[10px] font-bold cursor-not-allowed opacity-60"
                            >
                              <Rocket className="w-3 h-3" /> Boosted
                            </button>
                          )}
                          {'isReal' in camp && (
                            <button
                              onClick={() => handleDelete(camp.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-red-500 text-[10px] font-bold hover:bg-red-50 active:scale-95 transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Charts & Highlights columns */}
              <div className="space-y-6">
                
                {/* Engagement over time chart */}
                <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="font-bold text-sm text-gray-900">Engagement Over Time</h3>
                  <div className="h-32 flex items-end justify-between gap-2">
                    {barHeights.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                          className="w-full rounded-t-lg"
                          style={{ background: `rgba(161,64,0,${0.15 + (h / 100) * 0.65})` }}
                          title={`${h}% engagement`}
                        />
                        <span className="text-[8px] font-bold text-gray-400 group-hover:text-gray-800">{barDays[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top performing templates */}
                <div className="bg-white p-5 rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="font-bold text-sm text-gray-900">Top Performing</h3>
                  <div className="space-y-2">
                    {topPerforming.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 p-2.5 bg-[#fff8f5] rounded-xl border border-[#f7ece7]">
                        <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                        <span className="text-xs font-semibold text-gray-800 flex-1">{item.name}</span>
                        <span className="text-[10px] font-bold text-green-600">{item.growth}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/loyalty/analytics"
                    className="w-full pt-2 border-t border-gray-100 text-[#a14000] text-xs font-bold flex items-center justify-center gap-1 hover:underline"
                  >
                    View detailed analytics <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
