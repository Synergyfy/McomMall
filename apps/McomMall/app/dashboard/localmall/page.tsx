'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Star,
  Map,
  LayoutDashboard,
  Activity,
  Zap,
  ChevronRight,
  Building2,
  Globe,
  Radio,
  Sparkles,
  TrendingUp,
  Bell,
  BarChart3,
  Award,
  ArrowUpRight,
  CircleDot,
  ShieldCheck,
  Percent,
  MessageSquare,
  MapPin,
  Package,
  Coffee,
  Leaf,
  ChevronLeft,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'hub' | 'network' | 'rewards' | 'map';
type CommunitySubTab = 'community' | 'sponsorship' | 'growth';
type ProximityTier = 'high_street' | 'hyper_local' | 'nearby' | 'national';

// ─── Tier colours ─────────────────────────────────────────────────────────────
const TIER_META: Record<ProximityTier, { gradient: string; shadow: string; accent: string }> = {
  high_street: { gradient: 'from-yellow-400 via-amber-500 to-orange-500', shadow: 'rgba(245,158,11,0.4)', accent: '#d97706' },
  hyper_local: { gradient: 'from-orange-400 via-orange-500 to-red-500',   shadow: 'rgba(249,115,22,0.4)',  accent: '#ea580c' },
  nearby:      { gradient: 'from-orange-600 via-red-500 to-red-600',       shadow: 'rgba(234,88,12,0.4)',   accent: '#dc2626' },
  national:    { gradient: 'from-red-600 via-red-700 to-orange-800',       shadow: 'rgba(185,28,28,0.4)',   accent: '#b91c1c' },
};

// ─── Animated counter ────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ─── Stylised Map Background ──────────────────────────────────────────────────
function StyledMap({ area, postcode }: { area: string; postcode: string }) {
  return (
    <div className="relative w-full h-full bg-[#e9e3db] overflow-hidden rounded-3xl border border-gray-250/20">
      <iframe
        title="Live Interactive Map"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(postcode || area)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        className="w-full h-full border-0 absolute inset-0 filter grayscale-[10%] contrast-[95%]"
        loading="lazy"
      />
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated dots */}
        {[[60, 50], [110, 100], [170, 60], [230, 120], [80, 160], [280, 80]].map(([x, y], i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-orange-500 rounded-full"
            style={{ left: x, top: y }}
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ delay: i * 0.3, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Area label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-full shadow border border-white/90">
          <p className="text-[10px] font-black text-gray-700 tracking-widest uppercase">{area} Zone</p>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ logo, name }: { logo: string | null; name: string }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
      {logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
        : <span className="text-white font-bold text-sm">{name?.[0]?.toUpperCase() || 'M'}</span>
      }
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function LocalMallPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('hub');
  const [communityTab, setCommunityTab] = useState<CommunitySubTab>('community');
  const [area, setArea] = useState('Local');
  const [tier, setTier] = useState<ProximityTier>('high_street');
  const [businessName, setBusinessName] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [postcode, setPostcode] = useState('');

  const nodeCount = useCounter(1284, 1600);
  const sponsorPct = useCounter(65, 1200);

  useEffect(() => {
    const storedArea = localStorage.getItem('businessArea') || 'Local';
    const cleanedArea = storedArea
      .replace(/London Borough of /i, '')
      .replace(/Borough of /i, '')
      .replace(/City of /i, '')
      .trim();
    setArea(cleanedArea);
    setTier((localStorage.getItem('businessProximityTier') as ProximityTier) || 'high_street');
    const raw = localStorage.getItem('businessOnboarding');
    const ob = raw ? JSON.parse(raw) : {};
    setBusinessName(ob.businessName || '');
    setPostcode(ob.postcode || '');
    if (ob.logo) setLogo(ob.logo);
  }, []);

  const meta = TIER_META[tier] ?? TIER_META.high_street;

  // ── Tab config ──────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'network', label: 'Network', Icon: Users         },
    { id: 'rewards', label: 'Rewards', Icon: Star          },
    { id: 'map',     label: 'Map',     Icon: Map           },
    { id: 'hub',     label: 'Hub',     Icon: LayoutDashboard },
  ];

  // ── Mock partnership data ────────────────────────────────────────────────────
  const partnerships = [
    { pct: 96, name: `Artisan Coffee × Local Bakery`,     icon: Coffee },
    { pct: 92, name: `Community Garden Logistics`,         icon: Leaf   },
  ];

  // ── Network connections (mock) ───────────────────────────────────────────────
  const networkMembers = [
    { name: 'Green Bite Café',       tier: 'High Street', dist: '120m', color: '#d97706' },
    { name: 'Petal & Bloom Florist', tier: 'Hyper Local', dist: '340m', color: '#ea580c' },
    { name: 'Craft & Co Studio',     tier: 'High Street', dist: '510m', color: '#d97706' },
    { name: 'NorthSide Barbers',     tier: 'Hyper Local', dist: '720m', color: '#ea580c' },
    { name: 'Byte & Grind Tech',     tier: 'Nearby',      dist: '1.2km', color: '#dc2626' },
  ];

  // ── Rewards (mock) ───────────────────────────────────────────────────────────
  const rewardDeals = [
    { business: `Coffee Craft ${area}`, deal: 'Free Muffin with any hot drink',  pts: 50,  icon: Coffee,  expires: '2d' },
    { business: `Petals ${area}`,       deal: '15% Off Bloom Bouquet',            pts: 80,  icon: Leaf,    expires: '5d' },
    { business: 'Artisan Books',        deal: 'Buy 2 Get 1 Free',                 pts: 120, icon: Package, expires: '3d' },
    { business: `${area} Deli`,         deal: 'Free Side with Main',              pts: 60,  icon: Star,    expires: '1d' },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#f8f7f5] font-sans flex flex-col" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>

      {/* ── Global Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 pt-20 pb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex w-8 h-8 rounded-xl bg-gray-100 items-center justify-center mr-1 active:bg-gray-200 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <Avatar logo={logo} name={businessName} />
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">LocalMall</p>
            <p className="text-sm font-black text-gray-900 leading-tight">{area} LocalMall</p>
          </div>
        </div>
        <Radio className="w-5 h-5 text-gray-400" />
      </header>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">

          {/* ══ HUB TAB ═══════════════════════════════════════════════════ */}
          {activeTab === 'hub' && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="px-5 pt-6 space-y-5 pb-4"
            >
              {/* Title */}
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your LocalMall Hub</h1>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Optimise your community impact with real-time ecosystem intelligence.
                </p>
              </div>

              {/* Live Activity Card */}
              <div className="relative bg-gray-900 rounded-3xl p-5 overflow-hidden shadow-xl">
                {/* Glow */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${meta.gradient} opacity-20 blur-2xl`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Live Activity</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-2.5 py-1">
                      <ShieldCheck className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] font-bold text-green-400">Ecosystem Healthy</span>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-white tabular-nums">
                    {nodeCount.toLocaleString()}
                    <span className="text-lg font-bold text-gray-400 ml-2">nodes active</span>
                  </p>
                </div>
              </div>

              {/* AI Partnership Recommendations */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">AI Partnership Recommendations</p>
                    <p className="text-[11px] text-gray-400">Predictive matches based on your business profile.</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {partnerships.map((p, i) => {
                    const PIcon = p.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                            <PIcon className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-orange-600 mb-0.5">{p.pct}% Match</p>
                            <p className="text-xs font-bold text-gray-900">{p.name}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hyperlocal Opportunity Alerts */}
              <div
                className={`rounded-3xl p-5 bg-gradient-to-br ${meta.gradient} shadow-xl`}
                style={{ boxShadow: `0 16px 40px -10px ${meta.shadow}` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Hyperlocal Opportunity Alerts</p>
                    <p className="text-xs text-white/70 mt-0.5">Immediate needs detected in your sector.</p>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mb-4">
                  <p className="text-[9px] font-black text-white/60 tracking-widest uppercase mb-1">Trending Demand</p>
                  <p className="text-lg font-black text-white">Zero-Waste Packaging</p>
                </div>
                <button className="w-full py-2.5 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white text-xs font-bold tracking-wide hover:bg-white/30 transition-colors">
                  Review All Alerts
                </button>
              </div>

              {/* Community / Sponsorship / Growth Tabs */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Sub-tab bar */}
                <div className="flex border-b border-gray-100">
                  {(['community', 'sponsorship', 'growth'] as CommunitySubTab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCommunityTab(t)}
                      className={`flex-1 py-3.5 text-[11px] font-bold capitalize transition-colors relative ${
                        communityTab === t ? 'text-orange-500' : 'text-gray-400'
                      }`}
                    >
                      {t === 'community' ? 'Community' : t === 'sponsorship' ? 'Sponsorship' : 'Growth'}
                      {communityTab === t && (
                        <motion.div
                          layoutId="sub-tab-indicator"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Sub-tab content */}
                <AnimatePresence mode="wait">
                  {communityTab === 'community' && (
                    <motion.div
                      key="community"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 mb-0.5">Active Collaborations</p>
                          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                            You are participating in 4 community initiatives this month.
                          </p>
                          {/* Avatar stack */}
                          <div className="flex -space-x-2">
                            {['#f97316', '#ea580c', '#d97706'].map((c, i) => (
                              <div
                                key={i}
                                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                                style={{ backgroundColor: c }}
                              >
                                {String.fromCharCode(65 + i)}
                              </div>
                            ))}
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-gray-500">+2</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {communityTab === 'sponsorship' && (
                    <motion.div
                      key="sponsorship"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 mb-0.5">Sponsorship Reach</p>
                          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                            Your brand exposure is up 12% in the North District.
                          </p>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${meta.gradient} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${sponsorPct}%` }}
                              transition={{ duration: 1.2, ease: 'easeOut' }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">{sponsorPct}% of Target Reached</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {communityTab === 'growth' && (
                    <motion.div
                      key="growth"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                          <BarChart3 className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 mb-0.5">Growth Analytics</p>
                          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                            Unlock advanced heatmaps for customer footfall in your area.
                          </p>
                          <button className="flex items-center gap-1.5 text-xs font-bold" style={{ color: meta.accent }}>
                            Upgrade Pro
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enter Dashboard */}
              <Link href="/dashboard">
                <div className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 active:bg-gray-800 transition-colors">
                  Enter Dashboard
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* ══ NETWORK TAB ═══════════════════════════════════════════════ */}
          {activeTab === 'network' && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="px-5 pt-6 pb-4"
            >
              <div className="mb-5">
                <h2 className="text-xl font-black text-gray-900">Local Network</h2>
                <p className="text-xs text-gray-400 mt-1">Verified businesses in your {area} ecosystem.</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Active',    value: '14',   color: '#d97706' },
                  { label: 'Verified',  value: '9',    color: '#ea580c' },
                  { label: 'Partners',  value: '3',    color: '#dc2626' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 text-center">
                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Member list */}
              <div className="space-y-2.5">
                {networkMembers.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}bb)` }}
                    >
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: m.color, backgroundColor: `${m.color}15` }}
                        >
                          {m.tier}
                        </span>
                        <span className="text-[10px] text-gray-400">{m.dist} away</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ REWARDS TAB ═══════════════════════════════════════════════ */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="px-5 pt-6 pb-4"
            >
              <div className="mb-5">
                <h2 className="text-xl font-black text-gray-900">Nearby Rewards</h2>
                <p className="text-xs text-gray-400 mt-1">Exclusive deals for {area} LocalMall members.</p>
              </div>

              {/* Points balance card */}
              <div
                className={`rounded-3xl p-5 bg-gradient-to-br ${meta.gradient} mb-5 shadow-xl`}
                style={{ boxShadow: `0 16px 40px -10px ${meta.shadow}` }}
              >
                <p className="text-[10px] font-black text-white/60 tracking-widest uppercase mb-2">Your Points Balance</p>
                <p className="text-4xl font-black text-white tabular-nums">2,400</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-3.5 h-3.5 text-white/70" />
                  <p className="text-xs text-white/70 font-semibold">+320 pts this week</p>
                </div>
              </div>

              {/* Deal cards */}
              <div className="space-y-3">
                {rewardDeals.map((d, i) => {
                  const DIcon = d.icon;
                  return (
                    <motion.div
                      key={d.business}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                        <DIcon className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-orange-500 mb-0.5 truncate">{d.business}</p>
                        <p className="text-sm font-bold text-gray-900 leading-snug">{d.deal}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-semibold">{d.pts} pts</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-red-400 font-bold">Expires {d.expires}</span>
                        </div>
                      </div>
                      <button
                        className="shrink-0 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold"
                        style={{ background: `linear-gradient(135deg, ${meta.accent}, #ea580c)` }}
                      >
                        Claim
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══ MAP TAB ═══════════════════════════════════════════════════ */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="px-5 pt-6 pb-4"
            >
              <div className="mb-4">
                <h2 className="text-xl font-black text-gray-900">{area} Live Map</h2>
                <p className="text-xs text-gray-400 mt-1">Real-time activity in your local ecosystem.</p>
              </div>

              {/* Map */}
              <div className="rounded-3xl overflow-hidden shadow-lg" style={{ height: 320 }}>
                <StyledMap area={area} postcode={postcode} />
              </div>

              {/* Legend */}
              <div className="mt-4 bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-600 mb-3">Map Legend</p>
                <div className="space-y-2">
                  {[
                    { color: '#f97316', label: 'Active High Street Business' },
                    { color: '#ea580c', label: 'Hyper-Local Business'        },
                    { color: '#d97706', label: 'Nearby Business'             },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                      <p className="text-xs text-gray-500">{l.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { label: 'Businesses in view', value: '14', icon: Building2 },
                  { label: 'New this week',       value: '+3', icon: TrendingUp },
                ].map((s) => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <SIcon className="w-4 h-4 text-orange-500 mb-2" />
                      <p className="text-xl font-black text-gray-900">{s.value}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Bottom Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-safe">
        <div className="grid grid-cols-4 py-2">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-1 pt-2 pb-1 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-gradient-to-r ${meta.gradient}`}
                  />
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-orange-50'
                    : 'bg-transparent'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                </div>
                <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
