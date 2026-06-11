'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Star,
  Calendar,
  Tag,
  Grid3X3,
  Building2,
  Wallet,
  MessageSquare,
  User,
} from 'lucide-react';

type TabId = 'home' | 'discover' | 'promotions' | 'rewards' | 'events' | 'more';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [showMore, setShowMore] = React.useState(false);

  const getActiveTab = (): TabId => {
    if (pathname === '/dashboard') return 'home';
    if (pathname?.startsWith('/dashboard/discover')) return 'discover';
    if (pathname?.startsWith('/dashboard/promotions')) return 'promotions';
    if (pathname?.startsWith('/dashboard/rewards')) return 'rewards';
    if (pathname?.startsWith('/dashboard/events')) return 'events';
    if (
      pathname?.startsWith('/dashboard/localmall') ||
      pathname?.startsWith('/dashboard/wallet') ||
      pathname?.startsWith('/dashboard/messages') ||
      pathname?.startsWith('/dashboard/my-profile') ||
      pathname?.startsWith('/dashboard/interests')
    ) return 'more';
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs: { id: TabId; href?: string; icon: React.ElementType; label: string; onClick?: () => void }[] = [
    { id: 'home', href: '/dashboard', icon: Home, label: 'Home' },
    { id: 'discover', href: '/dashboard/discover', icon: Compass, label: 'Discover' },
    { id: 'promotions', href: '/dashboard/promotions', icon: Tag, label: 'Promotions' },
    { id: 'rewards', href: '/dashboard/rewards', icon: Star, label: 'Rewards' },
    { id: 'events', href: '/dashboard/events', icon: Calendar, label: 'Events' },
    { id: 'more', icon: Grid3X3, label: 'More', onClick: () => setShowMore(true) },
  ];

  const moreItems = [
    { href: '/dashboard/localmall', icon: Building2, label: 'Local Mall' },
    { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/dashboard/my-profile', icon: User, label: 'Profile' },
  ];

  React.useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff8f6]/95 backdrop-blur-md border-t border-[#e2bfb0]/30 flex justify-around items-center px-4 pb-4 pt-2 rounded-t-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
        {tabs.map(({ id, href, icon: Icon, label, onClick }) => {
          const isActive = activeTab === id;
          if (href) {
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
                <Icon className="w-5 h-5" />
                <span className="font-label-sm text-label-sm mt-0.5">{label}</span>
              </Link>
            );
          }
          return (
            <button
              key={id}
              onClick={onClick}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff9969] text-[#773005] rounded-full px-4 py-1 scale-90'
                  : 'text-[#5a4136] hover:text-[#a14000] px-4 py-1'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-label-sm text-label-sm mt-0.5">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── More Bottom Sheet ── */}
      {showMore && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#fff8f6] rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-5" />
            <h3 className="text-sm font-extrabold text-[#261812] mb-4">More</h3>
            <div className="grid grid-cols-4 gap-4">
              {moreItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#ff9969] text-[#773005]'
                        : 'bg-white text-[#5a4136] hover:bg-[#ffeae1]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[9px] font-bold text-center leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerBottomNav;
