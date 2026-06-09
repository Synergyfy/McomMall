'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Star,
  Calendar,
  User,
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

  const tabs = [
    { id: 'home' as const, href: '/dashboard', icon: Home, label: 'Home' },
    { id: 'discover' as const, href: '/dashboard/discover', icon: Compass, label: 'Discover' },
    { id: 'rewards' as const, href: '/dashboard/rewards', icon: Star, label: 'Rewards' },
    { id: 'events' as const, href: '/dashboard/events', icon: Calendar, label: 'Events' },
    { id: 'profile' as const, href: '/dashboard/interests', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff8f6]/95 backdrop-blur-md border-t border-[#e2bfb0]/30 flex justify-around items-center px-4 pb-4 pt-2 rounded-t-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
      {tabs.map(({ id, href, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <Link
            key={id}
            href={href}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              isActive
                ? 'bg-[#ff9969] text-[#773005] rounded-full px-4 py-1 scale-90'
                : 'text-[#5a4136] hover:text-[#a14000] px-4 py-1'
            }`}
          >
            <Icon
              className="w-5 h-5"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            />
            <span className="font-label-sm text-label-sm mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default CustomerBottomNav;
