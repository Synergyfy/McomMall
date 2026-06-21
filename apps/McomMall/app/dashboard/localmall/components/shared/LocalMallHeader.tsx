'use client';

import { FC } from 'react';
import { ChevronLeft, Bell, Search, Info } from 'lucide-react';

interface LocalMallHeaderProps {
  businessName: string;
  boroughName: string;
  highStreetName?: string;
  visibilityScore?: number;
  unreadNotifications?: number;
  canGoBack: boolean;
  onBack: () => void;
  onNotificationsClick: () => void;
  onSearchClick: () => void;
  onStatusClick: () => void;
}

export const LocalMallHeader: FC<LocalMallHeaderProps> = ({
  businessName,
  boroughName,
  highStreetName = 'Nelson Road',
  visibilityScore = 85,
  unreadNotifications = 3,
  canGoBack,
  onBack,
  onNotificationsClick,
  onSearchClick,
  onStatusClick,
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Local Mall</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs font-semibold text-gray-500">{boroughName}</span>
          </div>
          <h2 className="text-base font-black text-gray-900 leading-tight truncate max-w-[180px] sm:max-w-xs">
            {businessName}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Visibility Score Indicator */}
        <button 
          onClick={onStatusClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors active:scale-95"
        >
          <Info className="w-4 h-4" />
          <span className="text-xs font-bold">Reach Score: {visibilityScore}</span>
        </button>

        {/* Search Toggle */}
        <button
          onClick={onSearchClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 active:scale-90"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onNotificationsClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 relative active:scale-90"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
