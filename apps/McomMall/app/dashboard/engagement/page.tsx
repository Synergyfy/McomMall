'use client';

import Link from 'next/link';
import {
  Users,
  Monitor,
  Star,
  MessageSquare,
  RefreshCw,
  Navigation,
  Gift,
  CalendarCheck,
  Award,
  Target,
  Plus,
} from 'lucide-react';

export default function EngagementPage() {
  const goalPct = 88;

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5]">
      <div className="max-w-md lg:max-w-7xl mx-auto px-4 pt-5 pb-32 space-y-6">

        {/* ── TITLE HEADER FOR DESKTOP ONLY ── */}
        <div className="hidden lg:block pb-2 border-b border-[#e2bfb0]/20">
          <h1 className="text-2xl font-bold text-[#a14000]">Engagement Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage customer directory, loyalty programs, and communications.</p>
        </div>

        {/* ── SUMMARY CARDS GRID ── */}
        <section className="space-y-4">
          {/* Large Metrics Row: 2 columns on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Customers */}
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between border border-[#e2bfb0]/10" style={{ minHeight: '120px' }}>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-full bg-[#fff1eb] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#ea580c]" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  +12%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-gray-400">Total Customers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">2,450</h3>
              </div>
            </div>

            {/* Loyalty Members */}
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between border border-[#e2bfb0]/10" style={{ minHeight: '120px' }}>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-full bg-[#fef2f2] flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-[#ef4444]" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-gray-400">Loyalty Members</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">1,200</h3>
              </div>
            </div>

            {/* CSAT Score */}
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between border border-[#e2bfb0]/10" style={{ minHeight: '120px' }}>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-full bg-[#eff6ff] flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-gray-400">CSAT Score</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">4.8/5</h3>
              </div>
            </div>

            {/* Active Conversations */}
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between border border-[#e2bfb0]/10" style={{ minHeight: '120px' }}>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-full bg-[#fff7ed] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-gray-400">Active Conversations</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">12</h3>
              </div>
            </div>
          </div>

          {/* Mini Stats Row: 2 columns on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Returning',    value: '450', icon: RefreshCw, href: '/dashboard/engagement/returning' },
              { label: 'Nearby',       value: '24',  icon: Navigation, href: '/dashboard/engagement/nearby' },
              { label: 'Redemptions',  value: '89',  icon: Gift },
              { label: 'Participants', value: '34',  icon: CalendarCheck },
            ].map(({ label, value, icon: Icon, href }) => {
              const cardContent = (
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#fdf6f2] border border-[#f7ece7] h-full w-full shadow-sm hover:border-[#ffeae1] transition-colors">
                  <Icon className="w-4 h-4 shrink-0 text-gray-500" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">{label}</p>
                    <p className="text-base font-bold text-gray-900 leading-tight mt-0.5">{value}</p>
                  </div>
                </div>
              );

              return href ? (
                <Link key={label} href={href} className="block hover:opacity-95 active:scale-98 transition-all h-full w-full">
                  {cardContent}
                </Link>
              ) : (
                <div key={label} className="h-full w-full">
                  {cardContent}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── LOWER SECTION MULTI-COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width on desktop): Quick Actions & Live Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <section className="bg-white p-5 rounded-2xl border border-[#e2bfb0]/10 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                <Link href="/dashboard/loyalty/offers"
                  className="flex-none flex items-center gap-1.5 px-5 py-3 rounded-full font-bold text-xs text-white bg-[#a14000] shadow-[0_4px_12px_rgba(161,64,0,0.2)] hover:opacity-90 active:scale-95 transition-all">
                  <Gift className="w-3.5 h-3.5 shrink-0" />
                  Add Reward
                </Link>
                <Link href="/dashboard/engagement/promotion"
                  className="flex-none flex items-center gap-1.5 px-5 py-3 rounded-full font-bold text-xs text-gray-700 bg-white border border-[#e2bfb0] hover:bg-[#ffeae1]/30 active:scale-95 transition-all">
                  <Navigation className="w-3.5 h-3.5 shrink-0 rotate-45 text-gray-500" />
                  Send Promotion
                </Link>
              </div>
            </section>

            {/* Live Customer Activity */}
            <section className="space-y-4">
              <div className="flex justify-between items-baseline px-1">
                <h2 className="text-base font-extrabold text-gray-900">Live Customer Activity</h2>
                <Link href="/dashboard/messages" className="text-xs font-bold text-[#ea580c] hover:underline">
                  View All Activity
                </Link>
              </div>

              <div className="relative pl-3 space-y-4">
                <div className="absolute left-[5px] top-4 bottom-4 w-[2px] bg-[#f7ece7]" />

                {[
                  { dotColor: 'bg-[#a14000]', title: 'New customer joined',   time: '2 mins ago',  desc: 'Sarah Jenkins signed up for the Silver Tier loyalty program via the mobile app.' },
                  { dotColor: 'bg-[#a14000]', title: 'Reward redeemed',        time: '15 mins ago', desc: 'Alex Rivera redeemed "Free Coffee" reward at the Downtown Branch.' },
                  { dotColor: 'bg-blue-500',   title: 'Event RSVP',             time: '45 mins ago', desc: 'Maria Gomez RSVP\'d to the "Seasonal VIP Preview" next Thursday.' },
                  { dotColor: 'bg-orange-500', title: 'Review Received',        time: '1 hour ago',  desc: '5-star rating from Thomas K. "Amazing customer service as always!"' },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-4 items-start group">
                    <div className={`z-10 w-2.5 h-2.5 rounded-full shrink-0 mt-2 ${item.dotColor}`}
                      style={{ boxShadow: '0 0 0 4px #fff8f5' }} />
                    <div className="flex-1 p-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#f7ece7] group-hover:border-orange-500/10 transition-colors">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-bold text-sm text-gray-900">{item.title}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{item.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (1/3 width on desktop): Top Members & Goal Progress */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Top Loyalty Members */}
            <section className="space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 px-1">Top Loyalty Members</h2>
              <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#f7ece7] space-y-4">
                {[
                  { name: 'Emma Stone',  tier: 'Platinum • 12,450 pts', initials: 'ES', bg: 'bg-orange-100', color: 'text-orange-700', hasAward: true },
                  { name: 'John Doe',    tier: 'Gold • 8,230 pts',     initials: 'JD', bg: 'bg-orange-50',  color: 'text-orange-600' },
                  { name: 'Lisa Miller', tier: 'Gold • 7,900 pts',     initials: 'LM', bg: 'bg-orange-50',  color: 'text-orange-600' },
                ].map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${m.bg} ${m.color}`}>
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.tier}</p>
                    </div>
                    {m.hasAward && <Award className="w-5 h-5 text-red-500 shrink-0" />}
                  </div>
                ))}
                <Link href="/dashboard/loyalty/members"
                  className="block w-full py-2.5 text-center rounded-xl text-xs font-bold text-[#a14000] border border-[#e2bfb0] hover:bg-[#ffeae1]/30 transition-colors">
                  Manage Members
                </Link>
              </div>
            </section>

            {/* Engagement Goal */}
            <section>
              <div className="relative rounded-2xl overflow-hidden p-5 shadow-[0_8px_24px_rgba(234,88,12,0.2)]"
                style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
                
                {/* Pattern background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="gp" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="15" fill="none" stroke="white" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gp)" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-200" />
                    <h3 className="font-bold text-white text-sm">Engagement Goal</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-xs text-orange-100 font-medium">Monthly Goal: 2,500 Members</p>
                    <p className="text-2xl font-black text-white">{goalPct}%</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${goalPct}%`, background: '#ffb694' }} />
                  </div>
                  <p className="text-[11px] text-orange-100 leading-relaxed pt-1">
                    You're 300 members away from your monthly target. Keep it up!
                  </p>
                </div>

                {/* Overlapping plus icon button */}
                <Link href="/dashboard/loyalty/offers"
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-[#ea580c] shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all">
                  <Plus className="w-5 h-5" />
                </Link>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}
