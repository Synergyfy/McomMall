'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  PauseCircle,
  Rocket,
  Copy,
  BarChart2,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetPromotions, useDeletePromotion } from '@/service/promotions/hook';
import { toast } from 'sonner';

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

export function PromotionsManager() {
  const router = useRouter();
  const { data: promotions, isLoading, error } = useGetPromotions();
  const deletePromotion = useDeletePromotion();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion.mutateAsync(id);
      toast.success('Campaign deleted successfully!');
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  const activeCount = promotions?.filter(p => p.isActive).length ?? 0;

  // Build display campaigns from real data or fall back to static
  const displayCampaigns = promotions && promotions.length > 0
    ? promotions.map((p, i) => ({
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
        realId: p.id,
      }))
    : staticCampaigns;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#a14000]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">Error loading campaigns</p>
      </div>
    );
  }

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full bg-[#fff8f5] text-[#1f1b18]">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1f1b18] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-6">

        {/* ── BACK + HEADER ── */}
        <div className="flex items-center">
          <Link href="/dashboard/loyalty" className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            ← Back to Loyalty
          </Link>
        </div>

        <section className="space-y-1">
          <h2 className="font-bold text-2xl text-gray-900 leading-tight">Reward Campaigns</h2>
          <p className="text-xs text-gray-500">Drive customer loyalty through targeted proximity marketing.</p>
        </section>

        {/* ── GLOBAL METRICS BENTO ── */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { icon: BarChart2, label: 'Avg. Participation', value: '84%', color: 'text-[#a14000]', bg: 'bg-orange-50' },
            { icon: TrendingUp, label: 'Program ROI', value: '3.2x', color: 'text-[#00629f]', bg: 'bg-blue-50' },
            { icon: Users, label: 'New Referrals', value: '1.4k', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Zap, label: 'Active Boosts', value: String(activeCount || 12), color: 'text-red-600', bg: 'bg-red-50' },
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

        {/* ── ACTIVE CAMPAIGNS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Active Campaigns</h3>
            <Link
              href="/dashboard/loyalty/promotion/new"
              className="bg-[#a14000] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Campaign
            </Link>
          </div>

          <div className="space-y-4">
            {displayCampaigns.map((camp) => (
              <motion.div
                key={camp.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.03)] overflow-hidden relative"
              >
                {/* Badge */}
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

                  {/* Stats row */}
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

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {camp.actions.includes('edit') && (
                      <button
                        onClick={() => router.push(`/dashboard/loyalty/promotion/edit/${camp.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2bfb0] text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                    {camp.actions.includes('pause') && (
                      <button
                        onClick={() => showToast(`Campaign "${camp.title}" paused`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2bfb0] text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        <PauseCircle className="w-3 h-3" /> Pause
                      </button>
                    )}
                    {camp.actions.includes('duplicate') && (
                      <button
                        onClick={() => showToast(`Campaign "${camp.title}" duplicated`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2bfb0] text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        <Copy className="w-3 h-3" /> Duplicate
                      </button>
                    )}
                    {camp.actions.includes('boost') && (
                      <button
                        onClick={() => showToast(`Boost activated for "${camp.title}"!`)}
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
        </section>

        {/* ── ENGAGEMENT OVER TIME + TOP PERFORMING ── */}
        <section className="space-y-4">
          {/* Bar chart */}
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

          {/* Top performing */}
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
            <button className="w-full pt-2 border-t border-gray-100 text-[#a14000] text-xs font-bold flex items-center justify-center gap-1 hover:underline">
              View detailed analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}