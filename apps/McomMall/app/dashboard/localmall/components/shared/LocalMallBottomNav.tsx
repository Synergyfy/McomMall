'use client';

import { FC } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Zap, 
  Globe, 
  Sparkles 
} from 'lucide-react';

export type LocalMallTab = 'home' | 'highstreet' | 'partnerships' | 'visibility' | 'community' | 'expo';

interface LocalMallBottomNavProps {
  activeTab: LocalMallTab;
  onTabChange: (tab: LocalMallTab) => void;
}

export const LocalMallBottomNav: FC<LocalMallBottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home' as LocalMallTab, label: 'Home', icon: LayoutDashboard },
    { id: 'highstreet' as LocalMallTab, label: 'High Street', icon: MapPin },
    { id: 'partnerships' as LocalMallTab, label: 'Partners', icon: Users },
    { id: 'visibility' as LocalMallTab, label: 'Visibility', icon: Zap },
    { id: 'community' as LocalMallTab, label: 'Community', icon: Globe },
    { id: 'expo' as LocalMallTab, label: 'Expo', icon: Sparkles },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-1 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(162,63,0,0.05)] z-50 rounded-t-2xl pb-safe">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center flex-1 py-1 group relative transition-transform active:scale-95 duration-150"
          >
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
            )}
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-orange-50 text-orange-600' 
                : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[9px] font-bold mt-0.5 transition-colors ${
              isActive ? 'text-orange-600' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
