import React from 'react';
import { GeographicBadge } from '@/lib/utils/geo-utils';
import { Store, MapPin, Navigation, Globe } from 'lucide-react';

interface GeoBadgeProps {
  type: GeographicBadge;
  className?: string;
}

export default function GeoBadge({ type, className = '' }: GeoBadgeProps) {
  switch (type) {
    case 'HIGH_STREET':
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-sm ${className}`}>
          <Store className="w-4 h-4" />
          Premium High Street
        </div>
      );
    case 'HYPERLOCAL':
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold text-sm ${className}`}>
          <MapPin className="w-4 h-4" />
          Hyperlocal Ecosystem
        </div>
      );
    case 'NEARBY':
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold text-sm ${className}`}>
          <Navigation className="w-4 h-4" />
          Nearby Participant
        </div>
      );
    case 'REMOTE':
    default:
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full font-semibold text-sm ${className}`}>
          <Globe className="w-4 h-4" />
          Community Member
        </div>
      );
  }
}
