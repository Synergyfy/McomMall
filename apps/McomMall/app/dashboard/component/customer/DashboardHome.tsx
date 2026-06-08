'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin as MapPinIcon, 
  Search as SearchIcon, 
  Store as StoreIcon, 
  Gift as GiftIcon, 
  Calendar as CalendarIcon, 
  Dices as DicesIcon, 
  Sparkles as SparklesIcon, 
  Clock as ClockIcon, 
  Star as StarIcon,
  RotateCw as RotateCwIcon,
  CheckCircle2 as CheckIcon,
  TrendingUp as TrendingIcon,
  ChevronDown as ChevronDownIcon
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

const BOROUGHS = [
  'Manhattan Central',
  'Brooklyn Heights',
  'Queens Boulevard',
  'Staten Island Central',
  'Bronx Plaza'
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
  const [selectedBorough, setSelectedBorough] = useState<string>('Manhattan Central');
  const [isBoroughOpen, setIsBoroughOpen] = useState<boolean>(false);
  const [spinState, setSpinState] = useState<'ready' | 'spinning' | 'won'>('ready');
  const [spinResult, setSpinResult] = useState<string>('');

  const handleBoroughChange = (borough: string) => {
    setSelectedBorough(borough);
    setIsBoroughOpen(false);
  };

  const handleSpinClick = () => {
    if (spinState !== 'ready') return;
    setSpinState('spinning');
    
    // Simulate spin without useEffect using setTimeout
    window.setTimeout(() => {
      setSpinState('won');
      setSpinResult('Won 50 pts!');
      onAddPoints(50);
    }, 1500);
  };

  const handlePlayClick = () => {
    const element = document.getElementById('daily-spin-widget');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Temporary highlight
      element.classList.add('ring-4', 'ring-amber-400');
      window.setTimeout(() => {
        element.classList.remove('ring-4', 'ring-amber-400');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Greeting Header Card */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-orange-500 shadow-sm shrink-0">
            <AvatarFallback className="bg-orange-100 text-orange-600 font-extrabold text-sm flex items-center justify-center">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Welcome back</span>
            <span className="text-sm font-black text-orange-600 leading-none">{userName || 'MCOM Member'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#fcd400] text-[#6e5c00] px-3.5 py-1.5 rounded-full shadow-sm shrink-0">
          <SparklesIcon className="w-4 h-4 fill-[#6e5c00] text-[#6e5c00]" />
          <span className="text-xs font-black tracking-tight">{points.toLocaleString()}</span>
        </div>
      </div>

      {/* Borough Selector & Search */}
      <section className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setIsBoroughOpen(!isBoroughOpen)}>
            <MapPinIcon className="text-orange-500 w-5 h-5" />
            <span className="font-semibold text-sm text-slate-800">{selectedBorough}</span>
            <ChevronDownIcon className="text-slate-400 w-4 h-4 transition-transform duration-200" />
          </div>

          {isBoroughOpen && (
            <div className="absolute top-8 left-0 z-50 bg-white border border-slate-100 shadow-lg rounded-xl py-2 w-56 animate-in fade-in slide-in-from-top-2 duration-150">
              {BOROUGHS.map((b) => (
                <button
                  key={b}
                  onClick={() => handleBoroughChange(b)}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${selectedBorough === b ? 'text-orange-600 bg-orange-50/50' : 'text-slate-600'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm text-slate-800 placeholder:text-slate-400"
            placeholder="Search brands, food, or events..."
            type="text"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-4 gap-2">
        <button 
          onClick={() => setActiveTab('discover')}
          className="flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl group transition-all duration-200 min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
            <StoreIcon className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center truncate w-full">Discover</span>
        </button>

        <button 
          onClick={() => setActiveTab('rewards')}
          className="flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl group transition-all duration-200 min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
            <GiftIcon className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center truncate w-full">Rewards</span>
        </button>

        <button 
          onClick={() => setActiveTab('events')}
          className="flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl group transition-all duration-200 min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
            <CalendarIcon className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center truncate w-full">Events</span>
        </button>

        <button 
          onClick={handlePlayClick}
          className="flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl group transition-all duration-200 min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-rose-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
            <DicesIcon className="text-rose-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center truncate w-full">Play</span>
        </button>
      </section>

      {/* Daily Spin Widget */}
      <section 
        id="daily-spin-widget"
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/10 transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col gap-2 max-w-[65%]">
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider w-fit">
            Lucky Streak
          </span>
          <h2 className="text-xl font-bold tracking-tight">Daily Spin is Ready!</h2>
          <p className="text-xs text-white/90 leading-relaxed font-medium">
            Spin the wheel to win mystery mall credits and brand vouchers.
          </p>

          <button
            onClick={handleSpinClick}
            disabled={spinState !== 'ready'}
            className={`mt-4 px-5 py-2.5 rounded-xl text-xs font-bold w-fit flex items-center gap-2 transition-all active:scale-95 duration-150 ${spinState === 'won' ? 'bg-amber-100 text-amber-800' : 'bg-white text-orange-600 hover:bg-orange-50'}`}
          >
            {spinState === 'ready' && (
              <>
                Spin Now
                <SparklesIcon className="w-4 h-4" />
              </>
            )}
            {spinState === 'spinning' && (
              <>
                Spinning...
                <RotateCwIcon className="w-4 h-4 animate-spin" />
              </>
            )}
            {spinState === 'won' && (
              <>
                {spinResult}
                <CheckIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Decorative Spinning Element */}
        <div className={`absolute -right-12 -bottom-12 w-48 h-48 border-[12px] border-white/10 rounded-full flex items-center justify-center transition-all ${spinState === 'spinning' ? 'duration-1500 ease-out rotate-[1080deg]' : 'spin-element duration-20000 linear'}`}>
          <div className="w-36 h-36 border-[8px] border-white/20 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 border-[6px] border-white/30 rounded-full"></div>
          </div>
          <StarIcon className="absolute top-2 left-1/2 -translate-x-1/2 text-white/30 w-6 h-6" />
          <GiftIcon className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/30 w-6 h-6" />
          <StoreIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 w-6 h-6" />
          <SparklesIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 w-6 h-6" />
        </div>
      </section>

      {/* Nearby Offers (Horizontal Scroll) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Nearby Offers</h3>
          <button 
            onClick={() => setActiveTab('discover')} 
            className="text-orange-500 hover:text-orange-600 text-xs font-bold"
          >
            View all
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {/* Card 1 */}
          <div className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-md transition-all duration-200">
            <div className="relative h-36 bg-gradient-to-br from-orange-50 to-amber-50">
              <img
                alt="Cafe Offer"
                className="w-full h-full object-cover relative z-0"
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600"
              />
              <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold z-10">
                20% OFF
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">The Artisan Grind</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <ClockIcon className="w-3 h-3 text-slate-400" />
                <span>Ends in 2h</span>
                <span>•</span>
                <span>0.2 mi</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-md transition-all duration-200">
            <div className="relative h-36 bg-gradient-to-br from-indigo-50 to-blue-50">
              <img
                alt="Fashion Offer"
                className="w-full h-full object-cover relative z-0"
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600"
              />
              <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold z-10">
                DOUBLE POINTS
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Urban Threads</h4>
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <MapPinIcon className="w-3 h-3 text-slate-400" />
                <span>Level 2, North Wing</span>
                <span>•</span>
                <span>0.5 mi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Borough Activity Bento Grid Section */}
      <section className="space-y-4 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Borough Activity</h3>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Just now</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Card 1: Artisan Kitchen (Spans 2 columns on mobile, 1 on md) */}
          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setActiveTab('discover')}>
            <div className="h-40 relative bg-slate-50">
              <img 
                alt="Artisan Kitchen" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600"
              />
              <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <SparklesIcon className="w-3 h-3 fill-white" />
                TRENDING
              </div>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Artisan Kitchen</h4>
                <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                  Flash Sale: 2x Points on all lunch bowls until 2 PM.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                <StarIcon className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                <span>+50 PTS EXTRA</span>
              </div>
            </div>
          </div>

          {/* Card 2: Morning Brew */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setActiveTab('discover')}>
            <div className="h-32 relative bg-slate-50">
              <img 
                alt="Morning Brew" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
              />
            </div>
            <div className="p-4 flex-grow">
              <h4 className="font-bold text-slate-800 text-sm mb-1">Morning Brew</h4>
              <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                Claim your free refill
              </p>
            </div>
          </div>

          {/* Card 3: Borough Fitness */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setActiveTab('discover')}>
            <div className="h-32 relative bg-slate-50">
              <img 
                alt="Borough Fitness" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
              />
            </div>
            <div className="p-4 flex-grow">
              <h4 className="font-bold text-slate-800 text-sm mb-1">Borough Fitness</h4>
              <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                Class starts in 15m
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTEGRATED FORMER CONTENT --- */}
      <section className="space-y-4 pt-2 border-t border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Your Rewards & Stats Overview</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Real-time statistics of your Mcom purchases</p>
        </div>
        
        {isLoadingStats ? (
          <div className="py-4 text-center text-xs text-slate-400 font-semibold">Loading stats...</div>
        ) : stats ? (
          <StatsCards stats={stats} role={UserRole.CUSTOMER} />
        ) : (
          <div className="py-4 text-center text-xs text-slate-400 font-semibold">No statistics available.</div>
        )}
      </section>

      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Recent Activity Feed</h3>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">History</span>
        </div>
        
        <RecentActivities
          activities={activities}
          isLoading={isLoadingActivities}
        />
      </section>

      {/* Trending in Borough */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-800">Trending in {selectedBorough.split(' ')[0]}</h3>
        <div className="space-y-3">
          {/* Trending 1 */}
          <div 
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                alt="Sushi"
                className="w-full h-full object-cover bg-slate-50"
                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-bold text-slate-800 text-sm truncate">Sakura Zen Dining</h4>
                <span className="text-orange-500 font-extrabold text-[10px]">#1 Trending</span>
              </div>
              <p className="text-slate-500 text-[11px] font-medium truncate">Now offering seasonal lunch rewards...</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[85%]"></div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hot Now</span>
              </div>
            </div>
          </div>

          {/* Trending 2 */}
          <div 
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                alt="Sneakers"
                className="w-full h-full object-cover bg-slate-50"
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-bold text-slate-800 text-sm truncate">Velocity Sports</h4>
                <span className="text-emerald-600 font-extrabold text-[10px]">New Drop</span>
              </div>
              <p className="text-slate-500 text-[11px] font-medium truncate">Join the Sneaker Hunt event this Friday!</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-[40%]"></div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rising</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
