'use client';

import Link from 'next/link';
import {
  Heart,
  Crown,
  Gift,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Zap,
  Clock,
} from 'lucide-react';

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

const promotions = [
  { title: '10% off next visit', type: 'Discount',  used: 34, total: 50, icon: Gift },
  { title: 'Double Points Day',  type: 'Multiplier', used: 89, total: 100, icon: Zap },
  { title: 'Birthday Reward',    type: 'Reward',     used: 12, total: 20,  icon: Star },
];

export default function EngagementLoyaltyPage() {
  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden" style={{ background: '#fff8f5' }}>
      <div className="max-w-md mx-auto px-4 pt-5 pb-32 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1f1b18' }}>Loyalty</h2>
            <p className="text-xs" style={{ color: '#8e7164' }}>1,200 members · 88% of monthly goal</p>
          </div>
          <Link href="/dashboard/loyalty/offers"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: '#ea580c' }}>
            <Gift className="w-3.5 h-3.5" /> Add Reward
          </Link>
        </div>

        {/* Tier breakdown */}
        <div className="rounded-2xl p-4 bg-white space-y-3"
          style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 8px rgba(161,64,0,0.06)' }}>
          <h3 className="text-sm font-bold" style={{ color: '#1f1b18' }}>Tier Breakdown</h3>
          {[
            { tier: 'Platinum', count: 48,  pct: '4%',   color: '#9333ea' },
            { tier: 'Gold',     count: 202, pct: '17%',  color: '#f59e0b' },
            { tier: 'Silver',   count: 450, pct: '38%',  color: '#64748b' },
            { tier: 'Bronze',   count: 500, pct: '41%',  color: '#ea580c' },
          ].map((t) => (
            <div key={t.tier}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Crown className="w-3 h-3" style={{ color: t.color }} />
                  <span style={{ color: '#1f1b18' }}>{t.tier}</span>
                </span>
                <span className="text-xs" style={{ color: '#8e7164' }}>{t.count} · {t.pct}</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: '#f7ece7' }}>
                <div className="h-full rounded-full transition-all" style={{ width: t.pct, background: t.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Goal progress */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="lp" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="15" fill="none" stroke="white" strokeWidth="1" />
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#lp)" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-orange-100 text-xs font-semibold mb-1">Monthly Goal</p>
            <div className="flex items-end justify-between mb-2">
              <p className="text-white font-bold">2,500 Members</p>
              <p className="text-white text-2xl font-bold">88%</p>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full" style={{ width: '88%', background: '#ffb694' }} />
            </div>
            <p className="mt-2 text-xs text-orange-100">300 members away. Keep it up!</p>
          </div>
        </div>

        {/* Active Promotions */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold" style={{ color: '#1f1b18' }}>Active Promotions</h3>
            <Link href="/dashboard/loyalty/promotion" className="text-xs font-semibold" style={{ color: '#ea580c' }}>See all</Link>
          </div>
          <div className="space-y-2">
            {promotions.map((p) => {
              const Icon = p.icon;
              const pct = Math.round((p.used / p.total) * 100);
              return (
                <div key={p.title} className="flex items-center gap-3 p-3 rounded-2xl bg-white"
                  style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 6px rgba(161,64,0,0.05)' }}>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#1f1b18' }}>{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f7ece7' }}>
                        <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold shrink-0" style={{ color: '#8e7164' }}>{p.used}/{p.total}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#e2bfb0' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Members */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
            <h3 className="text-sm font-bold shrink-0" style={{ color: '#1f1b18' }}>Top Members</h3>
            <Link href="/dashboard/loyalty/members" className="text-xs font-semibold shrink-0" style={{ color: '#ea580c' }}>Manage all</Link>
          </div>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white"
                style={{ border: '1px solid #f7ece7', boxShadow: '0 2px 6px rgba(161,64,0,0.05)' }}>
                <span className="text-xs font-bold w-4 shrink-0 text-center" style={{ color: '#e2bfb0' }}>#{i + 1}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.bg} ${m.color}`}>
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1f1b18' }}>{m.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${tierColors[m.tier]}15`, color: tierColors[m.tier] }}>
                      {m.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f7ece7' }}>
                      <div className="h-full rounded-full" style={{ width: m.barW, background: m.barColor }} />
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: '#8e7164' }}>{m.pts} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
