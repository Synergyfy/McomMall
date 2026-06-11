'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Gift,
  Calendar,
  MoreVertical,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  Award,
  Crown,
  Shield,
  Zap,
} from 'lucide-react';

export default function LoyaltyMembersPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (action: string, name: string) => {
    setToastMessage(`${action} for ${name} initiated!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tiers = [
    { level: 'Level 5', name: 'VIP Exclusive',   icon: Crown,  bg: 'from-neutral-800 to-neutral-900' },
    { level: 'Level 4', name: 'Platinum Elite',  icon: Award,  bg: 'from-slate-400 to-slate-600' },
    { level: 'Level 3', name: 'Gold Tier',       icon: Zap,    bg: 'from-amber-400 to-amber-600' },
    { level: 'Level 2', name: 'Silver Standard', icon: Shield, bg: 'from-gray-300 to-gray-500' },
  ];

  const topMembers = [
    {
      name: 'Marcus Chen', tier: 'VIP', tierBg: 'bg-neutral-900 text-white',
      spent: '$12,450',
      avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLv80i9GrXlRdmC6fOnXwZs5pSFU9ShlA3pEM00HGNAHXAzAeDq0urhmbmqA9Cs1xUfpw9ffvOV8Rlt1KilPd5lZr2hniqxMxnGniaXKXBbLbMrffv1oOV7WYTpeS8H7u7EV3RQ3QeqS3oGH8kePcy7Toj1kv98iWpA0g6lenIkRZCMME3WLHAXY19R-O39Nk8e3rzlympXJjYnv-IRZrQazNkR_155OOyPiwQPbL74FUfQAOiuuRJy2Cq4',
      actions: [{ label: 'Reward', icon: Gift }, { label: 'Event', icon: Calendar }],
    },
    {
      name: 'Elena Rodriguez', tier: 'PLAT', tierBg: 'bg-slate-500 text-white',
      spent: '$8,920',
      avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvZIkmCe417O529OiPN6pPtGcjtHCjHmHftJAZNch1T0XQYq3fzgdxnhy2ANQ7tDp2xPREdmIWbUqdngsGiKHONsFkSuhGvfmPSnZAS1wZiANcRWPdMBdO7gw-EdnacGpyZfp5ci-vfjxFpUpyrdGSsv2-WEZUaRy_k6xxvnL5LEDEJCB8Dhw5rAoHbR5XFb9kMajmxuuUexNDzpkgSV8xy84uYNyWayv2GxLXSEYwjdfOnmDuvuhAmfiM',
      actions: [{ label: 'Upgrade', icon: ArrowUpRight }, { label: 'Reward', icon: Gift }],
    },
    {
      name: 'David Kim', tier: 'GOLD', tierBg: 'bg-amber-500 text-white',
      spent: '$5,300',
      avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtqyhMHGHHcB3mOchxe6_FZiBZmPNcFDbrDMfgpNE_biCMj_5sgD3VX7G6RPS3l_wit9wYIUHfPkTN8TuyRwF7HLfKjEM3ZroKDy6-QzkdxcraZkLarZ17838G_9K7cIZM3Dwxwzenc7_fOdkWTu_qNnJKPiNpT7STPvC4zYVUq9j-hL-rlJXphxdyYChuI_bYBjCKIPZ7B_RGIoPtwl5obF1qO_Ph35AjLTogZB76owNWdshhmD4YuyEI',
      actions: [{ label: 'Upgrade', icon: ArrowUpRight }, { label: 'Reward', icon: Gift }],
    },
  ];

  const expiringSoon = [
    { name: 'Sarah Connor', initials: 'SC', endsIn: '2 days' },
    { name: 'John Wick',    initials: 'JW', endsIn: '5 days' },
  ];

  const distMetrics = [
    { title: 'New Members',   value: '+128',  sub: '↑ 12%',  subColor: 'text-[#00629f]' },
    { title: 'Avg Points',    value: '2,450', sub: '',       subColor: '' },
    { title: 'Churn Rate',    value: '2.4%',  sub: '↓ 0.5%', subColor: 'text-green-600' },
    { title: 'Reward Value',  value: '$12.4k', sub: '',      subColor: '' },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden -mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full bg-[#fff8f5] text-[#1f1b18]">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-[#1f1b18] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl text-center mx-auto max-w-xs">
          {toastMessage}
        </div>
      )}

      <div className="w-full px-4 pt-5 pb-36 space-y-5" style={{ boxSizing: 'border-box' }}>

        {/* ── BACK ── */}
        <Link
          href="/dashboard/loyalty"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" /> Back to Loyalty
        </Link>

        {/* ── PAGE TITLE ── */}
        <div>
          <h2 className="font-bold text-xl text-gray-900">Loyalty Members</h2>
          <p className="text-xs text-gray-400 mt-0.5">1,200 active members · 88% of monthly goal</p>
        </div>

        {/* ── TIER CARDS — horizontal scroll inside page ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Membership Tiers</h3>
            <button className="text-[#a14000] font-bold text-xs shrink-0 hover:underline flex items-center gap-0.5">
              Benefits <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Scrollable row: clips to page width via overflow-x-auto on a contained div */}
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <div className="flex gap-3" style={{ width: 'max-content' }}>
              {tiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <motion.div
                    key={tier.name}
                    whileTap={{ scale: 0.96 }}
                    className={`w-44 h-32 rounded-2xl bg-gradient-to-br ${tier.bg} text-white relative overflow-hidden flex-shrink-0 shadow-md p-3.5 flex flex-col justify-between cursor-pointer`}
                  >
                    <div className="flex justify-between items-start">
                      <Icon className="w-6 h-6 text-white/90" />
                      <span className="text-[8px] font-black tracking-wider opacity-60 uppercase">{tier.level}</span>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-75 font-semibold">Active Members</p>
                      <h4 className="font-bold text-sm mt-0.5 leading-tight">{tier.name}</h4>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TOP PERFORMING MEMBERS ── */}
        <section className="bg-white rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.02)] p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-[#a14000] shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 leading-tight">Top Performing</p>
              <p className="text-[10px] text-gray-400">Highest lifetime spent</p>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-2">
            {topMembers.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#fff8f5] border border-[#f7ece7]"
              >
                {/* Avatar */}
                <img
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-orange-100"
                  src={member.avatar}
                  alt={member.name}
                />
                {/* Name + tier */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-gray-800 truncate">{member.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black shrink-0 ${member.tierBg}`}>
                      {member.tier}
                    </span>
                    <span className="text-[9px] text-gray-400 truncate">{member.spent}</span>
                  </div>
                </div>
                {/* Actions — only MoreVertical on mobile to save space */}
                <div className="flex items-center shrink-0">
                  {member.actions.map((act) => {
                    const ActIcon = act.icon;
                    return (
                      <button
                        key={act.label}
                        onClick={() => showToast(act.label, member.name)}
                        className="p-1.5 text-gray-400 hover:text-[#a14000] rounded-full transition-colors active:scale-90"
                        title={act.label}
                      >
                        <ActIcon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                  <button
                    onClick={() => showToast('More', member.name)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full pt-2 border-t border-gray-100 text-[#a14000] font-bold text-xs text-center hover:underline">
            View Full Leaderboard
          </button>
        </section>

        {/* ── EXPIRING SOON ── */}
        <section className="bg-white rounded-2xl border border-[#f7ece7] border-l-4 border-l-red-500 shadow-[0_4px_12px_rgba(161,64,0,0.02)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="font-bold text-sm text-red-700 flex-1">Expiring Soon</p>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
          </div>

          <div className="space-y-2">
            {expiringSoon.map((exp) => (
              <div
                key={exp.name}
                className="flex items-center gap-2 p-2.5 border border-[#f7ece7] rounded-xl bg-[#fff8f5]/50"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs text-[#a14000] border border-orange-200 shrink-0">
                  {exp.initials}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-gray-800 truncate">{exp.name}</p>
                  <p className="text-[9px] text-red-500 font-bold">Ends in {exp.endsIn}</p>
                </div>
                {/* Button */}
                <button
                  onClick={() => showToast('Extension', exp.name)}
                  className="shrink-0 px-3 py-1.5 bg-[#a14000] text-white rounded-full text-[10px] font-black hover:opacity-90 active:scale-95 transition-all"
                >
                  Extend
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── RETENTION BOOST ── */}
        <section className="bg-gradient-to-r from-[#ea580c] to-[#c2410c] p-4 rounded-2xl text-white relative overflow-hidden shadow-[0_8px_24px_rgba(234,88,12,0.15)]">
          <div className="relative z-10 space-y-2.5">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-200 shrink-0" /> Retention Boost
            </h3>
            <p className="text-xs text-orange-100 leading-relaxed">
              Offer 500 bonus points to all Silver members expiring this month.
            </p>
            <button
              onClick={() => showToast('Retention Boost Campaign', 'Silver Members')}
              className="bg-white text-[#c2410c] px-4 py-2 rounded-full font-bold text-xs shadow-md hover:bg-orange-50 transition-all active:scale-95"
            >
              Send Campaign
            </button>
          </div>
          <span className="absolute -right-4 -bottom-4 text-[100px] text-white/5 rotate-12 select-none pointer-events-none">⚡</span>
        </section>

        {/* ── LOYALTY DISTRIBUTION ── */}
        <section className="bg-white rounded-2xl border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.02)] p-4 space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Loyalty Distribution</h3>

          {/* Bar chart */}
          <div className="h-28 flex items-end gap-2 border-b border-gray-100 pb-1">
            {[
              { label: 'BR', h: '40%', color: 'bg-gray-300' },
              { label: 'SL', h: '25%', color: 'bg-gray-400' },
              { label: 'GD', h: '20%', color: 'bg-amber-500' },
              { label: 'PL', h: '10%', color: 'bg-slate-500' },
              { label: 'VP', h: '5%',  color: 'bg-neutral-900' },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className={`w-full ${bar.color} rounded-t-md`} style={{ height: bar.h }} />
                <span className="text-[8px] font-black text-gray-400">{bar.label}</span>
              </div>
            ))}
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2">
            {distMetrics.map((met) => (
              <div key={met.title} className="p-3 bg-[#fff8f5] rounded-xl border border-[#f7ece7]">
                <p className="text-[9px] text-gray-400 font-semibold">{met.title}</p>
                <p className="font-black text-sm text-gray-800 mt-0.5">
                  {met.value}
                  {met.sub && <span className={`text-[10px] font-bold ${met.subColor} ml-1`}>{met.sub}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
