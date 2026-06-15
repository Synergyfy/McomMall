'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { 
  LayoutDashboard, 
  PlusSquare,
  MapPin,
  Menu,
  Store,
  Users,
  Heart,
  MessageSquare,
  Star,
  Megaphone,
  BarChart2,
  Plus,
  Calendar,
} from 'lucide-react';

// ─── Regular dashboard nav items ──────────────────────────────────────────────
interface BottomNavItemProps {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
}

const BottomNavItem: FC<BottomNavItemProps> = ({ href, icon: Icon, label, isActive }) => (
  <Link href={href} className="flex flex-col items-center justify-center flex-1 py-1 group">
    <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
      <Icon className={`w-6 h-6 ${isActive ? 'fill-orange-600/10' : ''}`} />
    </div>
    <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
      {label}
    </span>
  </Link>
);

// ─── Engagement-specific tabs ─────────────────────────────────────────────────
const engagementTabs = [
  { label: 'Overview',  icon: LayoutDashboard, href: '/dashboard/engagement' },
  { label: 'Customers', icon: Users,           href: '/dashboard/engagement/customers' },
  { label: 'Loyalty',   icon: Heart,           href: '/dashboard/engagement/loyalty' },
  { label: 'Messages',  icon: MessageSquare,   href: '/dashboard/engagement/messages' },
  { label: 'Reviews',   icon: Star,            href: '/dashboard/engagement/reviews' },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface BottomNavProps {
  onMenuClick: () => void;
}

export const BottomNav: FC<BottomNavProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEngagement = pathname.startsWith('/dashboard/engagement');
  const isPromotions = pathname?.startsWith('/dashboard/promotions');

  // ── Promotions bottom nav ──
  if (isPromotions) {
    const showStats = searchParams.get('show_stats') === 'true';
    const showMore = searchParams.get('show_more') === 'true';
    const isPromotionsActive = pathname === '/dashboard/promotions' && !showStats && !showMore;
    const isNewActive = pathname.startsWith('/dashboard/promotions/new');
    
    return (
      <div className="promotions-dashboard">
        {/* BottomNavBar (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-outline-variant/20 flex items-center justify-around px-2 z-50 pb-safe rounded-t-2xl shadow-lg">
          <Link href="/dashboard" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className="p-1.5 rounded-xl transition-all duration-200 text-gray-400 group-hover:text-gray-600">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-gray-400">Home</span>
          </Link>
          
          <Link href="/dashboard/promotions" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isPromotionsActive ? 'bg-primary/10 text-primary' : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              <Megaphone className={`w-6 h-6 ${isPromotionsActive ? 'fill-primary/10' : ''}`} />
            </div>
            <span className={`text-[10px] font-bold mt-0.5 ${isPromotionsActive ? 'text-primary' : 'text-gray-400'}`}>Promos</span>
          </Link>

          <Link href="/dashboard/events" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className="p-1.5 rounded-xl transition-all duration-200 text-gray-400 group-hover:text-gray-600">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-gray-400">Events</span>
          </Link>

          <Link href="/dashboard/promotions?show_more=true" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              showMore ? 'bg-primary/10 text-primary' : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              <Menu className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold mt-0.5 ${showMore ? 'text-primary' : 'text-gray-400'}`}>More</span>
          </Link>
        </nav>
        {/* Floating Action Button (Mobile Only, positioned above bottom nav) */}
        {!isNewActive && (
          <Link 
            href="/dashboard/promotions/new" 
            className="md:hidden fixed right-6 bottom-20 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <Plus className="w-8 h-8" />
          </Link>
        )}
      </div>
    );
  }

  const isEvents = pathname?.startsWith('/dashboard/events');

  // ── Events bottom nav ──
  if (isEvents) {
    const isEventsActive = pathname === '/dashboard/events';
    return (
      <div className="events-dashboard">
        {/* BottomNavBar (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-outline-variant/20 flex items-center justify-around px-2 z-50 pb-safe rounded-t-2xl shadow-lg">
          <Link href="/dashboard" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className="p-1.5 rounded-xl transition-all duration-200 text-gray-400 group-hover:text-gray-600">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-gray-400">Home</span>
          </Link>
          
          <Link href="/dashboard/promotions" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className="p-1.5 rounded-xl transition-all duration-200 text-gray-400 group-hover:text-gray-600">
              <Megaphone className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-gray-400">Deals</span>
          </Link>

          <Link href="/dashboard/events" className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isEventsActive ? 'bg-primary/10 text-primary' : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              <Calendar className={`w-6 h-6 ${isEventsActive ? 'fill-primary/10' : ''}`} />
            </div>
            <span className={`text-[10px] font-bold mt-0.5 ${isEventsActive ? 'text-primary' : 'text-gray-400'}`}>Events</span>
          </Link>

          <button onClick={onMenuClick} className="flex flex-col items-center justify-center flex-1 py-1 group">
            <div className="p-1.5 rounded-xl text-gray-400 group-hover:text-gray-600 transition-all duration-200">
              <Menu className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-gray-400">More</span>
          </button>
        </nav>
      </div>
    );
  }

  // ── Engagement bottom nav ──
  if (isEngagement) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-2 z-50 pb-safe">
        {engagementTabs.map((tab) => {
          const isActive =
            tab.href === '/dashboard/engagement'
              ? pathname === '/dashboard/engagement'
              : pathname.startsWith(tab.href);
          return (
            <BottomNavItem
              key={tab.label}
              href={tab.href}
              icon={tab.icon}
              label={tab.label}
              isActive={isActive}
            />
          );
        })}
      </nav>
    );
  }

  // ── Regular dashboard bottom nav ──
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-2 z-50 pb-safe">
      <BottomNavItem
        href="/dashboard"
        icon={LayoutDashboard}
        label="Home"
        isActive={pathname === '/dashboard'}
      />
      <BottomNavItem
        href="/dashboard/localmall"
        icon={MapPin}
        label="LocalMall"
        isActive={pathname.includes('/dashboard/localmall')}
      />
      <div className="flex-1 flex justify-center">
        <Link href="/dashboard/add-listing" className="relative -top-4">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center text-white transform rotate-45">
            <PlusSquare className="w-7 h-7 -rotate-45" />
          </div>
        </Link>
      </div>
      <BottomNavItem
        href="/dashboard/storefront"
        icon={Store}
        label="Storefront"
        isActive={pathname.includes('/dashboard/storefront')}
      />
      <button
        onClick={onMenuClick}
        className="flex flex-col items-center justify-center flex-1 py-1 group"
      >
        <div className="p-1.5 rounded-xl text-gray-400 group-hover:text-gray-600 transition-all duration-200">
          <Menu className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-gray-400">More</span>
      </button>
    </nav>
  );
};
