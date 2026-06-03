'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Building2,
  MapPin,
  Star,
  Eye,
  Calendar,
  Bell,
  Users,
  Globe,
  Zap,
  Shield,
  Trophy,
  Wifi,
  ArrowRight,
  Activity,
  Radio,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
type ProximityTier = 'high_street' | 'hyper_local' | 'nearby' | 'national';

interface TierFeature {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
}

interface TierConfig {
  label: string;
  headline: string;
  evolvedLine1: string;
  evolvedLine2: string;
  gradientClass: string;
  shadowColor: string;
  iconColor: string;
  liveLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: TierFeature[];
}

// ─── Tier Config ─────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<ProximityTier, TierConfig> = {
  high_street: {
    label: 'High Street',
    headline: 'You Are a High Street Business',
    evolvedLine1: 'Your High Street,',
    evolvedLine2: 'Evolved.',
    gradientClass: 'from-yellow-400 via-amber-500 to-orange-500',
    shadowColor: 'rgba(245, 158, 11, 0.45)',
    iconColor: '#d97706',
    liveLabel: 'LIVE ECOSYSTEM',
    Icon: Building2,
    description:
      'Your business is positioned inside an active local high street ecosystem.',
    features: [
      { icon: Eye, title: 'Premium Visibility', desc: 'Top-tier discovery for local shoppers.' },
      { icon: Calendar, title: 'High Street Expos', desc: 'Exclusive invites to physical local events.' },
      { icon: Star, title: 'Featured Placement', desc: 'Priority slot in the daily merchant feed.' },
      { icon: Bell, title: 'Priority Campaigns', desc: 'Early access to network-wide promotions.' },
    ],
  },
  hyper_local: {
    label: 'Hyper Local',
    headline: 'You Are a Hyper-Local Business',
    evolvedLine1: 'Your Neighbourhood,',
    evolvedLine2: 'Evolved.',
    gradientClass: 'from-orange-400 via-orange-500 to-red-500',
    shadowColor: 'rgba(249, 115, 22, 0.45)',
    iconColor: '#ea580c',
    liveLabel: 'LIVE ECOSYSTEM',
    Icon: MapPin,
    description:
      'Your business is embedded in a hyper-local neighbourhood ecosystem.',
    features: [
      { icon: MapPin, title: 'Hyper-Local Discovery', desc: 'Found first by shoppers within 500 m.' },
      { icon: Users, title: 'Community Deals', desc: 'Exclusive offers to your neighbourhood.' },
      { icon: Calendar, title: 'Local Events', desc: 'Priority access to area events and markets.' },
      { icon: Bell, title: 'Neighbourhood Feed', desc: 'Featured in the local community feed.' },
    ],
  },
  nearby: {
    label: 'Nearby',
    headline: "You're a Nearby Business",
    evolvedLine1: 'Your Area,',
    evolvedLine2: 'Evolved.',
    gradientClass: 'from-orange-600 via-red-500 to-red-600',
    shadowColor: 'rgba(234, 88, 12, 0.45)',
    iconColor: '#dc2626',
    liveLabel: 'LIVE NETWORK',
    Icon: Zap,
    description:
      'Your business connects to a thriving nearby local commerce network.',
    features: [
      { icon: Globe, title: 'Area Reach', desc: 'Connect with customers in a 10-mile radius.' },
      { icon: Star, title: 'Nearby Offers', desc: 'Publish deals to nearby shoppers.' },
      { icon: Calendar, title: 'Regional Events', desc: 'Participate in regional expo events.' },
      { icon: Wifi, title: 'Broadcast Campaigns', desc: 'Send campaigns to the local network.' },
    ],
  },
  national: {
    label: 'National',
    headline: "You're a National Business",
    evolvedLine1: 'Your Brand,',
    evolvedLine2: 'Evolved.',
    gradientClass: 'from-red-600 via-red-700 to-orange-800',
    shadowColor: 'rgba(185, 28, 28, 0.45)',
    iconColor: '#b91c1c',
    liveLabel: 'LIVE NETWORK',
    Icon: Globe,
    description:
      'Your business joins a national network of verified commerce partners.',
    features: [
      { icon: Globe, title: 'National Exposure', desc: 'Reach customers across the country.' },
      { icon: Shield, title: 'Online Storefront', desc: 'Full digital presence on McomMall.' },
      { icon: Wifi, title: 'Digital Campaigns', desc: 'Run targeted online marketing campaigns.' },
      { icon: Trophy, title: 'Analytics Suite', desc: 'Track performance with advanced analytics.' },
    ],
  },
};

// ─── Animated Map Dot ────────────────────────────────────────────────────────
function MapDot({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute w-3 h-3 bg-orange-500 rounded-full"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.7, 1, 0.7] }}
      transition={{ delay, duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ─── Stylised Map Background ─────────────────────────────────────────────────
function MapBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#e9e3db] ${className}`}>
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d8d2ca 1px, transparent 1px),
            linear-gradient(to bottom, #d8d2ca 1px, transparent 1px)
          `,
          backgroundSize: '38px 38px',
        }}
      />
      {/* Horizontal road */}
      <div className="absolute left-0 right-0 h-7 bg-[#d3cdc5]/70" style={{ top: '38%' }} />
      {/* Vertical road */}
      <div className="absolute top-0 bottom-0 w-7 bg-[#d3cdc5]/70" style={{ left: '35%' }} />
    </div>
  );
}

// ─── Avatar / Logo ───────────────────────────────────────────────────────────
function Avatar({
  logo,
  name,
  size = 'md',
}: {
  logo: string | null;
  name: string;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${dim} rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="Logo" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold">{name?.[0]?.toUpperCase() || 'M'}</span>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LocalMallSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<ProximityTier>('high_street');
  const [businessName, setBusinessName] = useState('');
  const [area, setArea] = useState('');
  const [postcode, setPostcode] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // ── Load local data + geocode area ─────────────────────────────────────────
  useEffect(() => {
    const storedTier = (localStorage.getItem('businessProximityTier') as ProximityTier) || 'high_street';
    const raw = localStorage.getItem('businessOnboarding');
    const onboarding = raw ? JSON.parse(raw) : {};

    setTier(storedTier);
    setBusinessName(onboarding.businessName || '');
    if (onboarding.logo) setLogo(onboarding.logo);

    const pc: string = onboarding.postcode || '';
    setPostcode(pc);

    if (pc) {
      resolveArea(pc);
    } else {
      setIsReady(true);
    }
  }, []);

  const resolveArea = async (pc: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pc)}&format=json&addressdetails=1&limit=1`,
        { headers: { 'User-Agent': 'McomMall/1.0 (contact@mcommall.com)' } },
      );
      const data = await res.json();
      if (data?.[0]) {
        const addr = data[0].address || {};
        const derived =
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          addr.town ||
          addr.city_district ||
          addr.city ||
          addr.county ||
          pc.split(' ')[0];
        setArea(derived);
        localStorage.setItem('businessArea', derived);
      } else {
        setArea(pc.split(' ')[0]);
        localStorage.setItem('businessArea', pc.split(' ')[0]);
      }
    } catch {
      const fallback = pc.split(' ')[0];
      setArea(fallback);
      localStorage.setItem('businessArea', fallback);
    } finally {
      setIsReady(true);
    }
  };

  const handleEnterLocalMall = () => {
    localStorage.setItem('localMallSetupComplete', 'true');
    router.replace('/dashboard/localmall?signup=true');
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.high_street;
  const TierIcon = config.Icon;
  const areaLabel = (area || postcode.split(' ')[0] || 'Local')
    .replace(/London Borough of /i, '')
    .replace(/Borough of /i, '')
    .replace(/City of /i, '')
    .trim();

  const deals = [
    { business: `Coffee Craft ${areaLabel}`, deal: 'Free Muffin' },
    { business: `Petals ${areaLabel}`, deal: '15% Off Bloom' },
  ];
  const expo = {
    title: `${areaLabel} Weekend Expo`,
    date: 'Starts Saturday, 10:00 AM',
    location: 'at Rye Lane',
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#f8f7f5] font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">

        {/* ════ STEP 0 — Tier Reveal ════════════════════════════════════════ */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-[100dvh] flex flex-col"
          >
            <div className="flex-1 overflow-y-auto pb-28">

              {/* Header */}
              <div className="px-5 pt-20 pb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar logo={logo} name={businessName} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">
                      Welcome to
                    </p>
                    <p className="text-sm font-black text-gray-900 leading-tight truncate">
                      {areaLabel} LocalMall
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Hero */}
              <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 190, damping: 14, delay: 0.25 }}
                  className="mb-7"
                >
                  <div
                    className={`w-28 h-28 rounded-full bg-gradient-to-br ${config.gradientClass} flex items-center justify-center`}
                    style={{ boxShadow: `0 24px 64px -10px ${config.shadowColor}` }}
                  >
                    <TierIcon className="w-14 h-14 text-white" />
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[1.65rem] font-black text-gray-900 mb-3 leading-tight tracking-tight"
                >
                  {config.headline}
                </motion.h1>

                <motion.p
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-500 leading-relaxed max-w-xs"
                >
                  {config.description}
                </motion.p>
              </div>

              {/* Map preview */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mx-5 mb-7 rounded-3xl overflow-hidden shadow-lg relative border border-gray-250/20"
                style={{ height: 174 }}
              >
                <iframe
                  title="Active Zone Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(postcode || areaLabel)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0 absolute inset-0 filter grayscale-[15%] contrast-[95%]"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-white/95">
                    <p className="text-[10px] font-black tracking-[0.18em] text-gray-700 uppercase">Active Zone</p>
                  </div>
                </div>
              </motion.div>

              {/* Feature list */}
              <div className="px-5 space-y-3">
                {config.features.map((feat, i) => {
                  const FeatIcon = feat.icon;
                  return (
                    <motion.div
                      key={feat.title}
                      initial={{ x: 28, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.65 + i * 0.09 }}
                      className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100/80"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${config.iconColor}18` }}
                      >
                        <FeatIcon className="w-[18px] h-[18px]" style={{ color: config.iconColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{feat.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{feat.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="fixed bottom-0 inset-x-0 px-5 pb-8 pt-4 bg-[#f8f7f5]/90 backdrop-blur-md border-t border-gray-100/60">
              <motion.button
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(1)}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${config.gradientClass} text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-xl`}
                style={{ boxShadow: `0 14px 32px -8px ${config.shadowColor}` }}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ════ STEP 1 — Live Ecosystem ════════════════════════════════════ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-[100dvh] flex flex-col bg-white"
          >
            <div className="flex-1 overflow-y-auto pb-28">

              {/* Header */}
              <div className="px-5 pt-20 pb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar logo={logo} name={businessName} />
                  <p className="text-sm font-black text-gray-900 truncate">{areaLabel} LocalMall</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-700 tracking-wider">CONNECTED</span>
                  </div>
                  <Radio className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Title */}
              <div className="px-5 mb-5">
                <p className="text-[10px] font-black tracking-[0.2em] text-orange-500 mb-1.5 uppercase">
                  {config.liveLabel}
                </p>
                <h1 className="text-[2rem] font-black text-gray-900 leading-tight tracking-tight">
                  {config.evolvedLine1}
                  <br />
                  <span style={{ color: config.iconColor }}>{config.evolvedLine2}</span>
                </h1>
              </div>

              {/* Map with live dots + active businesses overlay */}
              <div className="mx-5 mb-5 rounded-3xl overflow-hidden shadow-md relative border border-gray-250/20" style={{ height: 210 }}>
                <iframe
                  title="Live Ecosystem Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(postcode || areaLabel)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0 absolute inset-0 filter grayscale-[10%] contrast-[95%]"
                  loading="lazy"
                />
                <div className="relative w-full h-full pointer-events-none">
                  {/* Animated orange dots */}
                  <MapDot x={28} y={38} delay={0} />
                  <MapDot x={70} y={110} delay={0.3} />
                  <MapDot x={115} y={55} delay={0.6} />
                  <MapDot x={160} y={90} delay={0.9} />
                  <MapDot x={210} y={35} delay={0.4} />
                  <MapDot x={195} y={130} delay={0.7} />
                </div>

                {/* Overlay card */}
                <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm px-4 py-3.5 flex items-center justify-between border-t border-gray-100 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Activity className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none">14 Active Businesses</p>
                      <p className="text-xs text-gray-400 mt-0.5">Nearby</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Nearby Rewards */}
              <div className="mx-5 mb-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Nearby Rewards</h3>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Earn 2× points at shops within 500m today.
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${config.iconColor}, #ea580c)`,
                      boxShadow: `0 8px 20px -4px ${config.shadowColor}`,
                    }}
                  >
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {deals.map((deal, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-3.5">
                      <p className="text-xs font-bold mb-1 truncate" style={{ color: config.iconColor }}>
                        {deal.business}
                      </p>
                      <p className="text-sm font-black text-gray-900">{deal.deal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expo + Community row */}
              <div className="mx-5 mb-5 grid grid-cols-2 gap-3">
                {/* Expo */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.2em] text-orange-500 uppercase mb-2">EXPO</p>
                    <h4 className="text-sm font-black text-gray-900 leading-snug mb-1">{expo.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-tight">
                      {expo.date} {expo.location}.
                    </p>
                  </div>
                  <button className="mt-3 text-xs font-bold flex items-center gap-1" style={{ color: config.iconColor }}>
                    View Event <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Community Activity */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px]">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2 mb-4">
                    {['#f97316', '#ea580c', '#d97706', '#dc2626'].map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-gray-600">+12</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">Community Activity</p>
                    <p className="text-[11px] text-gray-400 leading-tight">24 new posts from neighbours</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 px-10 leading-relaxed">
                Step inside your neighbourhood&apos;s digital centre and start exploring.
              </p>
            </div>

            {/* CTA */}
            <div className="fixed bottom-0 inset-x-0 px-5 pb-8 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100/60">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleEnterLocalMall}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-base flex items-center justify-center gap-2.5 tracking-wide shadow-xl shadow-orange-500/30"
              >
                ENTER LOCALMALL
                <span className="text-xl">🚀</span>
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
