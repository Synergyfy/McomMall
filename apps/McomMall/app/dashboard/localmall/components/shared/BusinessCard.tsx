'use client';

import { FC } from 'react';
import { StatusBadge } from './StatusBadge';
import { MapPin, MessageSquare, Plus } from 'lucide-react';

interface BusinessCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  isClaimed?: boolean;
  isVerified?: boolean;
  logoUrl?: string;
  onViewProfile?: (id: string) => void;
  onActionClick?: (id: string) => void;
  actionLabel?: string;
}

export const BusinessCard: FC<BusinessCardProps> = ({
  id,
  name,
  category,
  description,
  address,
  isClaimed = false,
  isVerified = false,
  logoUrl,
  onViewProfile,
  onActionClick,
  actionLabel = 'Collab',
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-[0_8px_24px_rgba(162,63,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Logo & Category */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 overflow-hidden flex items-center justify-center shrink-0 border border-orange-100">
              {logoUrl ? (
                <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-black text-orange-600 uppercase">{name.charAt(0)}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{category}</span>
              <h4 className="text-sm font-black text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                {name}
              </h4>
            </div>
          </div>
          {/* Status badge */}
          <StatusBadge isVerified={isVerified} isClaimed={isClaimed} />
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>

        {address && (
          <div className="flex items-center gap-1 text-gray-400 mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold truncate">{address}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={() => onViewProfile?.(id)}
          className="flex-1 py-2 text-center text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors active:scale-95 duration-150"
        >
          View Profile
        </button>
        {onActionClick && (
          <button
            onClick={() => onActionClick(id)}
            className="flex-1 py-2 text-center text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 rounded-xl transition-all shadow-sm active:scale-95 duration-150 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
