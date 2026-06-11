'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin, Search, Store, Gift, Calendar, Dices, Sparkles, Clock,
  Star, RotateCw, ChevronDown, Bell, QrCode, ChevronRight,
  Utensils, Dumbbell, Coffee, Layers, RefreshCw, Heart, Zap,
  Map, Award, Ticket, Sun, Plus, CloudSun, Thermometer, Droplets
} from 'lucide-react';

import StatsCards from '../StatsCards';
import RecentActivities from '../RecentActivities';
import { CustomerStatsDto, OwnerStatsDto } from '@/service/stats/types';
import { UserRole } from '@/service/auth/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardHomeProps {
  userName: string;
  points: number;
  stats: OwnerStatsDto | CustomerStatsDto | null;
  isLoadingStats: boolean;
  activities: any;
  isLoadingActivities: boolean;
  onAddPoints: (amount: number) => void;
  setActiveTab: (tab: 'home' | 'discover' | 'rewards' | 'events' | 'profile') => void;
}

const UK_LOCATIONS = [
  'Camden Town',
  'Shoreditch',
  'Greenwich',
  'Notting Hill',
  'Brixton',
];

const MOCK_BUSINESSES = [
  {
    id: 'urban-bistro',
    name: 'The Urban Bistro',
    category: 'Dining',
    rating: 4.8,
    distance: '0.4 miles',
    price: '$$',
    tag: 'Reward available',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'peak-performance',
    name: 'Peak Performance',
    category: 'Health',
    rating: 4.9,
    distance: '1.2 miles',
    price: 'Member Exclusive',
    tag: 'Reward available',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
  },
];

const ACTIVITY_ITEMS = [
  {
    id: 'artisan-kitchen',
    title: 'Artisan Kitchen',
    desc: 'Flash Sale: 2x Points on all lunch bowls until 2 PM.',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    tag: 'TRENDING',
    tagColor: 'bg-emerald-600',
    points: '+50 PTS EXTRA',
    spanFull: true,
  },
  {
    id: 'morning-brew',
    title: 'Morning Brew',
    desc: 'Claim your free refill',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
    tag: null,
    tagColor: null,
    points: null,
    spanFull: false,
  },
  {
    id: 'borough-fitness',
    title: 'Borough Fitness',
    desc: 'Class starts in 15m',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    tag: null,
    tagColor: null,
    points: null,
    spanFull: false,
  },
];

const TRENDING_ITEMS = [
  {
    name: 'Sakura Zen Dining',
    desc: 'Now offering seasonal lunch rewards...',
    tag: '#1 Trending',
    tagColor: 'text-[#a14000]',
    progress: 85,
    progressColor: 'bg-[#a14000]',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Velocity Sports',
    desc: 'Join the Sneaker Hunt event this Friday!',
    tag: 'New Drop',
    tagColor: 'text-emerald-600',
    progress: 40,
    progressColor: 'bg-emerald-600',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  },
];

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName,
  points,
  stats,
  isLoadingStats,
  activities,
  isLoadingActivities,
  onAddPoints,
  setActiveTab,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [selectedBorough, setSelectedBorough] = useState('Camden Town');
  const [isBoroughOpen, setIsBoroughOpen] = useState(false);
  const [spinState, setSpinState] = useState<'ready' | 'spinning' | 'won'>('ready');
  const [spinResult, setSpinResult] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsRefreshing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleBoroughChange = (borough: string) => {
    setSelectedBorough(borough);
    setIsBoroughOpen(false);
  };

  const handleSpinClick = () => {
    if (spinState !== 'ready') return;
    setSpinState('spinning');
    setTimeout(() => {
      setSpinState('won');
      setSpinResult('Won 50 pts!');
      onAddPoints(50);
    }, 1500);
  };

  const handlePlayClick = () => {
    const el = document.getElementById('daily-spin-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('ring-4', 'ring-[#ff6900]/50');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#ff6900]/50'), 1500);
    }
  };

  return (
    <div className="space-y-6 pb-6 relative min-h-screen">
      {/* ── Refreshing Overlay ── */}
      {isRefreshing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fff8f6]/90 backdrop-blur-sm transition-opacity duration-700">
          <div className="relative flex items-center justify-center w-24 h-24 mb-4">
            <div className="animate-pulse-ring absolute w-24 h-24 rounded-full border-4 border-[#ff6900] opacity-20" />
            <div
              className="animate-pulse-ring absolute w-24 h-24 rounded-full border-4 border-[#ff6900] opacity-20"
              style={{ animationDelay: '0.5s' }}
            />
            <div
              className="animate-pulse-ring absolute w-24 h-24 rounded-full border-4 border-[#ff6900] opacity-20"
              style={{ animationDelay: '1s' }}
            />
            <div className="z-10 bg-[#f8ddd2] p-3 rounded-full shadow-lg animate-refresh-bounce">
              <RefreshCw className="text-[#a14000] text-3xl w-8 h-8 font-bold animate-rotate-sync" />
            </div>
          </div>
          <p className="font-label-md text-label-md text-[#a14000] animate-pulse">
            Syncing Borough Pulse...
          </p>
        </div>
      )}

      {/* ── Top App Bar ── */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-full border-2 border-[#ff6900] overflow-hidden">
            <AvatarFallback className="bg-[#ff6900]/10 text-[#a14000] font-extrabold">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-[#5a4136]">
              Welcome back,
            </span>
            <span className="font-headline-md text-headline-md font-bold text-[#a14000] leading-none">
              {userName || 'Member'}!
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#ff9969] px-2.5 py-1 rounded-full">
            <Star className="w-[14px] h-[14px] fill-[#773005] text-[#773005]" />
            <span className="text-[11px] font-extrabold text-[#773005]">
              {points.toLocaleString()} pts
            </span>
            <span className="w-px h-3 bg-[#773005]/30 mx-0.5" />
            <span className="text-[10px] font-bold text-[#773005]">
              Gold
            </span>
          </div>
          <button className="p-2 hover:bg-[#f8ddd2] rounded-full transition-colors">
            <Bell className="w-6 h-6 text-[#5a4136]" />
          </button>
        </div>
      </header>

      {/* ── Location & Weather Widget ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2a3a] via-[#2c3e50] to-[#34495e] p-5 rounded-2xl text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <CloudSun className="w-full h-full" />
        </div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <CloudSun className="w-7 h-7" />
              </div>
              <div>
                <div className="relative">
                  <button
                    onClick={() => setIsBoroughOpen(!isBoroughOpen)}
                    className="flex items-center gap-1 text-base font-bold"
                  >
                    {selectedBorough}
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  </button>
                  {isBoroughOpen && (
                    <div className="absolute top-8 left-0 z-50 bg-white border border-[#e2bfb0] shadow-lg rounded-xl py-2 w-48 animate-in fade-in slide-in-from-top-2 duration-150">
                      {UK_LOCATIONS.map((b) => (
                        <button
                          key={b}
                          onClick={() => handleBoroughChange(b)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                            selectedBorough === b
                              ? 'text-[#a14000] bg-[#fff1ec]'
                              : 'text-[#5a4136] hover:bg-[#fff8f6]'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-sm font-bold">18&deg;C</span>
                  </div>
                  <span className="w-px h-3 bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-xs text-white/80">65%</span>
                  </div>
                  <span className="w-px h-3 bg-white/20" />
                  <span className="text-xs text-white/80 flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Partly Cloudy
                  </span>
                </div>
              </div>
            </div>
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white text-[10px] flex items-center justify-center font-bold">
                85%
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white/30 bg-[#ff6900] text-white text-[10px] flex items-center justify-center font-bold">
                LVL4
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#ff6900] rounded-full" style={{ width: '80%' }} />
            </div>
            <span className="text-[10px] font-semibold text-white/70">High Activity</span>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-4 pb-2">
          {[
            { icon: QrCode, label: 'Scan QR', color: 'bg-[#ff6900] text-white' },
            { icon: Gift, label: 'Redeem', color: 'bg-[#ff9969] text-[#773005]' },
            { icon: Calendar, label: 'Book', color: 'bg-[#f8ddd2] text-[#261812]' },
            { icon: Map, label: 'Map', color: 'bg-[#f8ddd2] text-[#261812]' },
            { icon: Layers, label: 'Trends', color: 'bg-[#f8ddd2] text-[#261812]' },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
              onClick={() => {
                if (label === 'Discover') setActiveTab('discover');
                if (label === 'Redeem') setActiveTab('rewards');
              }}
            >
              <div
                className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg group-active:scale-90 transition-transform`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <span className="font-label-sm text-label-sm font-semibold text-[#261812]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Gamification Banner ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#a14000] p-6 text-white shadow-xl min-h-[160px] flex flex-col justify-between">
          <div className="z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full font-label-sm text-label-sm font-bold mb-2">
              Happening Now
            </span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile leading-tight">
              3 new offers in your borough
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="z-10 w-fit mt-4 px-6 py-2 bg-white text-[#a14000] rounded-full font-label-md text-label-md hover:bg-[#ffdbcc] transition-colors"
          >
            Explore Now
          </button>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
            <Store className="w-full h-full" />
          </div>
        </div>

        <div
          id="daily-spin-widget"
          className="rounded-2xl bg-[#f8ddd2] p-6 border border-[#e2bfb0] flex items-center gap-4 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex-1 z-10">
            <h3 className="font-label-md text-label-md font-extrabold text-[#a14000] mb-1">
              Lucky Streak: Day 5
            </h3>
            <p className="font-body-md text-body-md font-bold text-[#261812] mb-2">
              Your Daily Spin is ready!
            </p>
            <div className="w-full bg-[#fff1ec] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#a14000] h-full transition-all duration-1000"
                style={{ width: spinState === 'won' ? '100%' : '70%' }}
              />
            </div>
            <button
              onClick={handleSpinClick}
              disabled={spinState !== 'ready'}
              className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                spinState === 'won'
                  ? 'bg-emerald-100 text-emerald-800'
                  : spinState === 'spinning'
                  ? 'bg-[#ff9969] text-[#773005]'
                  : 'bg-[#ff6900] text-white hover:bg-[#a14000]'
              }`}
            >
              {spinState === 'ready' && 'Spin Now'}
              {spinState === 'spinning' && (
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3 animate-spin" /> Spinning...
                </span>
              )}
              {spinState === 'won' && spinResult}
            </button>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#ff9969] flex items-center justify-center shadow-lg animate-bounce duration-1000">
              <Dices className="w-7 h-7 text-[#773005]" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </section>

      {/* ── Recommended for You ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-headline-md text-[#261812]">
            Recommended for You
          </h2>
          <button className="text-[#a14000] font-label-md text-label-md flex items-center">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_BUSINESSES.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-[#e2bfb0]/30"
            >
              <div className="h-40 relative">
                <img
                  alt={biz.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={biz.image}
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-[#ff9969] text-[#773005] font-label-sm text-label-sm font-bold rounded-full shadow-sm">
                  {biz.tag}
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md text-white font-label-sm text-label-sm font-bold rounded flex items-center gap-1">
                  {biz.category === 'Dining' ? (
                    <Utensils className="w-[14px] h-[14px]" />
                  ) : (
                    <Dumbbell className="w-[14px] h-[14px]" />
                  )}
                  {biz.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-headline-md leading-tight text-[#261812]">
                    {biz.name}
                  </h3>
                  <span className="flex items-center gap-0.5 text-[#97481e] font-bold">
                    {biz.rating}{' '}
                    <Star className="w-[16px] h-[16px] fill-[#97481e] text-[#97481e]" />
                  </span>
                </div>
                <p className="text-[#5a4136] font-body-md text-body-md mb-4">
                  {biz.category === 'Dining'
                    ? 'Artisanal fusion kitchen with locally sourced ingredients.'
                    : 'Elite training facility featuring state-of-the-art bio-tracking.'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#f8ddd2] text-[#5a4136] rounded font-label-sm text-label-sm font-bold">
                    {biz.distance}
                  </span>
                  <span className="px-2 py-1 bg-[#f8ddd2] text-[#5a4136] rounded font-label-sm text-label-sm font-bold">
                    {biz.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Picked for You ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#a14000]" />
          <h2 className="font-headline-md text-headline-md text-[#261812]">
            Picked for you
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 row-span-2 bg-white/70 backdrop-blur-[12px] border border-white/30 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
            <div className="z-10">
              <span className="text-[#a14000] font-label-sm text-label-sm font-bold uppercase tracking-widest mb-2 block">
                Curation AI
              </span>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile max-w-[200px] mb-4 text-[#261812]">
                Next Gen Running Gear
              </h3>
              <p className="text-[#5a4136] font-body-md text-body-md mb-6">
                Based on your gym activity last week.
              </p>
            </div>
            <div className="z-10 flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#f8ddd2] flex items-center justify-center text-xs font-bold text-[#a14000]">
                  S
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#fff1ec] flex items-center justify-center text-xs font-bold text-[#5a4136]">
                  B
                </div>
              </div>
              <span className="font-label-md text-label-md font-bold text-[#a14000]">
                +4 items
              </span>
            </div>
            <div className="absolute -right-10 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-[200px] h-[200px]" />
            </div>
          </div>

          <div className="bg-[#f8ddd2] rounded-3xl p-4 flex flex-col items-center text-center justify-center gap-2 border border-[#e2bfb0]/30">
            <Coffee className="w-9 h-9 text-[#a14000]" />
            <h4 className="font-label-md text-label-md font-bold text-[#261812]">
              Morning Blend
            </h4>
            <span className="bg-[#009efb] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              REDEEM 200 PTS
            </span>
          </div>

          <div className="bg-[#f8ddd2] rounded-3xl p-4 flex flex-col items-center text-center justify-center gap-2 border border-[#e2bfb0]/30">
            <Ticket className="w-9 h-9 text-[#a14000]" />
            <h4 className="font-label-md text-label-md font-bold text-[#261812]">
              Rooftop Jazz
            </h4>
            <span className="bg-[#ff6900] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              EXCLUSIVE
            </span>
          </div>

          <div className="col-span-2 bg-[#ff6900] text-white rounded-3xl p-5 flex items-center justify-between">
            <div>
              <h4 className="font-headline-md text-headline-md">Boost Rewards</h4>
              <p className="font-label-sm text-label-sm font-semibold opacity-80">
                Invite a friend to MCOM Mall
              </p>
            </div>
            <button className="bg-white text-[#a14000] px-4 py-2 rounded-full font-label-md text-label-md font-bold">
              Share
            </button>
          </div>
        </div>
      </section>

      {/* ── Borough Activity Bento ── */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline-md text-headline-md text-[#261812]">
            What&apos;s New
          </h2>
          <button className="text-[#a14000] font-label-md text-label-md font-bold">
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ACTIVITY_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`${
                item.spanFull ? 'col-span-2 md:col-span-1' : ''
              } bg-white rounded-xl border border-[#e2bfb0]/30 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-200 cursor-pointer`}
              onClick={() => setActiveTab('discover')}
            >
              <div className="h-40 relative bg-[#fff1ec]">
                <img
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={item.image}
                />
                {item.tag && (
                  <div className="absolute top-3 left-3 ${item.tagColor} text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-white" />
                    {item.tag}
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#5a4136] hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-[#261812] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[#5a4136] font-label-sm text-label-sm font-semibold leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                {item.points && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#97481e]">
                    <Zap className="w-4 h-4 fill-[#97481e] text-[#97481e]" />
                    <span>{item.points}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Integrated Stats & Activities ── */}
      <section className="space-y-4 pt-2 border-t border-[#e2bfb0]/30">
        <div>
          <h3 className="font-headline-md text-headline-md text-[#261812]">
            Your Rewards &amp; Stats Overview
          </h3>
          <p className="font-label-sm text-label-sm font-semibold text-[#5a4136] mt-0.5">
            Real-time statistics of your Mcom purchases
          </p>
        </div>
        {isLoadingStats ? (
          <div className="py-4 text-center text-xs text-[#5a4136] font-semibold">
            Loading stats...
          </div>
        ) : stats ? (
          <StatsCards stats={stats} role={UserRole.CUSTOMER} />
        ) : (
          <div className="py-4 text-center text-xs text-[#5a4136] font-semibold">
            No statistics available.
          </div>
        )}
      </section>

      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-[#261812]">
            Recent Activity Feed
          </h3>
          <span className="text-[10px] font-bold text-[#a14000] uppercase tracking-widest">
            History
          </span>
        </div>
        <RecentActivities activities={activities} isLoading={isLoadingActivities} />
      </section>

      {/* ── Trending in Borough ── */}
      <section className="space-y-3">
        <h3 className="font-headline-md text-headline-md text-[#261812]">
          Trending in {selectedBorough.split(' ')[0]}
        </h3>
        <div className="space-y-3">
          {TRENDING_ITEMS.map((item) => (
            <div
              key={item.name}
              onClick={() => setActiveTab('discover')}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e2bfb0]/30 hover:bg-[#fff1ec] transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#fff1ec] flex-shrink-0">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover"
                  src={item.image}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-label-md text-label-md font-bold text-[#261812] truncate">
                    {item.name}
                  </h4>
                  <span className={`font-extrabold text-[10px] ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
                <p className="text-[#5a4136] text-[11px] font-semibold truncate">
                  {item.desc}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 flex-1 bg-[#f8ddd2] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.progressColor} rounded-full`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-[#5a4136] uppercase tracking-wider">
                    {item.progress > 70 ? 'Hot Now' : 'Rising'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
