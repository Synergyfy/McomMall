'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusSquare, 
  ShoppingBag, 
  Settings, 
  Menu,
  Heart,
  MapPin
} from 'lucide-react';

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

interface BottomNavProps {
  onMenuClick: () => void;
}

export const BottomNav: FC<BottomNavProps> = ({ onMenuClick }) => {
  const pathname = usePathname();

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
        href="/dashboard/store" 
        icon={ShoppingBag} 
        label="Store" 
        isActive={pathname.includes('/store')} 
      />
      <button 
        onClick={onMenuClick}
        className="flex flex-col items-center justify-center flex-1 py-1 group"
      >
        <div className="p-1.5 rounded-xl text-gray-400 group-hover:text-gray-600 transition-all duration-200">
          <Menu className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold mt-0.5 text-gray-400">
          More
        </span>
      </button>
    </nav>
  );
};
