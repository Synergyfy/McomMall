'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Gift,
  MapPin,
  QrCode,
  Star,
  PartyPopper,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

const ALL_ACTIVITIES = [
  {
    id: 1,
    type: 'reward',
    icon: Gift,
    iconBg: 'bg-orange-100',
    iconColor: 'text-[#a14000]',
    name: 'Sarah Jenkins',
    title: 'Claimed: Free Artisan Latte',
    desc: 'Redeemed 500 Loyalty Points at the Downtown branch.',
    time: '2 mins ago',
    category: 'rewards',
    stars: 0,
  },
  {
    id: 2,
    type: 'visit',
    icon: MapPin,
    iconBg: 'bg-blue-100',
    iconColor: 'text-[#00629f]',
    name: 'Marcus Thorne',
    title: 'Checked-in: Main Street Store',
    desc: 'Walked in through the front entrance. Third visit this week!',
    time: '15 mins ago',
    category: 'visits',
    stars: 0,
  },
  {
    id: 3,
    type: 'qr',
    icon: QrCode,
    iconBg: 'bg-orange-50',
    iconColor: 'text-[#a14000]',
    name: 'Elena Rodriguez',
    title: 'Scanned: "Summer Special" QR',
    desc: 'Interactive menu accessed via patio table #4.',
    time: '42 mins ago',
    category: 'qr',
    stars: 0,
  },
  {
    id: 4,
    type: 'review',
    icon: Star,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    name: 'David Wu',
    title: 'Left a 5-star Review',
    desc: '"The new seasonal layout is fantastic. Staff were incredibly helpful with my reward claim!"',
    time: '1 hour ago',
    category: 'rewards',
    stars: 5,
  },
  {
    id: 5,
    type: 'event',
    icon: PartyPopper,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    name: 'Chloe Simmonds',
    title: 'RSVP: Community Workshop',
    desc: "Joined 'Sustainable Living 101' happening this Saturday.",
    time: '3 hours ago',
    category: 'visits',
    stars: 0,
  },
  {
    id: 6,
    type: 'reward',
    icon: Gift,
    iconBg: 'bg-orange-100',
    iconColor: 'text-[#a14000]',
    name: 'James Patel',
    title: 'Claimed: 20% Off Voucher',
    desc: 'Redeemed 300 points at the West Quarter branch.',
    time: '4 hours ago',
    category: 'rewards',
    stars: 0,
  },
  {
    id: 7,
    type: 'qr',
    icon: QrCode,
    iconBg: 'bg-orange-50',
    iconColor: 'text-[#a14000]',
    name: 'Aisha Nkomo',
    title: 'Scanned: "Loyalty Card" QR',
    desc: 'Points balance check via the shop front QR display.',
    time: '5 hours ago',
    category: 'qr',
    stars: 0,
  },
  {
    id: 8,
    type: 'visit',
    icon: MapPin,
    iconBg: 'bg-blue-100',
    iconColor: 'text-[#00629f]',
    name: 'Tom Richards',
    title: 'Checked-in: Canary Wharf Pop-up',
    desc: 'First visit to the pop-up location. Welcomed with a bonus point notification.',
    time: '6 hours ago',
    category: 'visits',
    stars: 0,
  },
];

const FILTERS = [
  { id: 'all',     label: 'All Activity' },
  { id: 'qr',     label: 'QR Scans' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'visits',  label: 'Visits' },
];

export default function CustomerActivityPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(5);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = activeFilter === 'all'
    ? ALL_ACTIVITIES
    : ALL_ACTIVITIES.filter((a) => a.category === activeFilter);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="-mx-2 sm:-mx-5 -mt-2 sm:-mt-5 min-h-full overflow-x-hidden bg-[#fff8f5] text-[#1f1b18]">
      <div className="max-w-md mx-auto px-4 pt-5 pb-36 space-y-5">

        {/* ── BACK ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/engagement/customers"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" /> Back to Customers
          </Link>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full bg-white border border-[#f7ece7] text-gray-400 hover:text-[#a14000] hover:border-orange-200 transition-all active:scale-90"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-700 ${refreshing ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* ── HEADER ── */}
        <section className="space-y-0.5">
          <h2 className="font-bold text-xl text-gray-900">Customer Activity</h2>
          <p className="text-xs text-gray-400">Real-time interactions from your local community.</p>
        </section>

        {/* ── FILTER PILLS ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setActiveFilter(f.id); setVisibleCount(5); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                  isActive
                    ? 'bg-[#a14000] text-white shadow-sm'
                    : 'bg-white border border-[#e2bfb0] text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── ACTIVITY TIMELINE ── */}
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-[#f7ece7] rounded-full" />

          <AnimatePresence mode="popLayout">
            {visible.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="relative flex items-start gap-3 z-10"
                >
                  {/* Icon dot */}
                  <div className={`w-9 h-9 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                    <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 min-w-0 bg-white rounded-2xl p-3.5 border border-[#f7ece7] shadow-[0_4px_12px_rgba(161,64,0,0.03)] hover:shadow-[0_6px_20px_rgba(161,64,0,0.07)] transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-gray-500">{activity.name}</p>
                        <h4 className="font-bold text-sm text-[#a14000] mt-0.5 leading-tight truncate">
                          {activity.title}
                        </h4>
                        {activity.stars > 0 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: activity.stars }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {activity.desc}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── LOAD MORE ── */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((v) => v + 5)}
            className="w-full py-3 rounded-xl bg-white border border-[#f7ece7] text-[#a14000] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-orange-50 active:scale-[0.98] transition-all shadow-sm"
          >
            View Older Activity <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}

        {!hasMore && filtered.length > 0 && (
          <p className="text-center text-[10px] text-gray-400 font-semibold pt-2">
            You've reached the end of the activity feed
          </p>
        )}

      </div>
    </div>
  );
}
