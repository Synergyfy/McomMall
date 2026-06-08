'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home as HomeIcon, 
  Compass as CompassIcon, 
  Star as StarIcon, 
  Calendar as CalendarIcon, 
  User as UserIcon 
} from 'lucide-react';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();

  const getActiveTab = (): 'home' | 'discover' | 'rewards' | 'events' | 'profile' => {
    if (pathname === '/dashboard') return 'home';
    if (pathname?.startsWith('/dashboard/discover')) return 'discover';
    if (pathname?.startsWith('/dashboard/rewards')) return 'rewards';
    if (pathname?.startsWith('/dashboard/events')) return 'events';
    if (pathname?.startsWith('/dashboard/interests')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center px-2 py-1.5 pb-safe md:hidden">
      {/* Home */}
      <Link 
        href="/dashboard"
        className="flex flex-col items-center justify-center flex-1 py-0.5 group"
      >
        <div className={`px-4 py-1 rounded-full transition-all duration-200 ${activeTab === 'home' ? 'bg-[#fcd400]/40 text-[#6e5c00]' : 'text-slate-400 group-hover:text-slate-600'}`}>
          <HomeIcon className="w-5 h-5" />
        </div>
        <span className={`text-[9px] font-bold mt-0.5 ${activeTab === 'home' ? 'text-[#6e5c00]' : 'text-slate-400'}`}>
          Home
        </span>
      </Link>

      {/* Discover */}
      <Link 
        href="/dashboard/discover"
        className="flex flex-col items-center justify-center flex-1 py-0.5 group"
      >
        <div className={`px-4 py-1 rounded-full transition-all duration-200 ${activeTab === 'discover' ? 'bg-[#fcd400]/40 text-[#6e5c00]' : 'text-slate-400 group-hover:text-slate-600'}`}>
          <CompassIcon className="w-5 h-5" />
        </div>
        <span className={`text-[9px] font-bold mt-0.5 ${activeTab === 'discover' ? 'text-[#6e5c00]' : 'text-slate-400'}`}>
          Discover
        </span>
      </Link>

      {/* Rewards */}
      <Link 
        href="/dashboard/rewards"
        className="flex flex-col items-center justify-center flex-1 py-0.5 group"
      >
        <div className={`px-4 py-1 rounded-full transition-all duration-200 ${activeTab === 'rewards' ? 'bg-[#fcd400]/40 text-[#6e5c00]' : 'text-slate-400 group-hover:text-slate-600'}`}>
          <StarIcon className="w-5 h-5" />
        </div>
        <span className={`text-[9px] font-bold mt-0.5 ${activeTab === 'rewards' ? 'text-[#6e5c00]' : 'text-slate-400'}`}>
          Rewards
        </span>
      </Link>

      {/* Events */}
      <Link 
        href="/dashboard/events"
        className="flex flex-col items-center justify-center flex-1 py-0.5 group"
      >
        <div className={`px-4 py-1 rounded-full transition-all duration-200 ${activeTab === 'events' ? 'bg-[#fcd400]/40 text-[#6e5c00]' : 'text-slate-400 group-hover:text-slate-600'}`}>
          <CalendarIcon className="w-5 h-5" />
        </div>
        <span className={`text-[9px] font-bold mt-0.5 ${activeTab === 'events' ? 'text-[#6e5c00]' : 'text-slate-400'}`}>
          Events
        </span>
      </Link>

      {/* Profile / Interest Selection */}
      <Link 
        href="/dashboard/interests"
        className="flex flex-col items-center justify-center flex-1 py-0.5 group"
      >
        <div className={`px-4 py-1 rounded-full transition-all duration-200 ${activeTab === 'profile' ? 'bg-[#fcd400]/40 text-[#6e5c00]' : 'text-slate-400 group-hover:text-slate-600'}`}>
          <UserIcon className="w-5 h-5" />
        </div>
        <span className={`text-[9px] font-bold mt-0.5 ${activeTab === 'profile' ? 'text-[#6e5c00]' : 'text-slate-400'}`}>
          Interests
        </span>
      </Link>
    </nav>
  );
};

export default CustomerBottomNav;
