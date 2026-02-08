'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { IBusiness } from '@/service/merchant/types';

interface ServiceSellerCardProps {
  business: IBusiness | undefined;
}

export default function ServiceSellerCard({ business }: ServiceSellerCardProps) {
  if (!business) return null;

  const displayName = business.businessName || 'Provider';
  const logoUrl = business.logoUrl;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
          {logoUrl ? (
             <Image src={logoUrl} alt={displayName} fill className="object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400">
               <User size={32} />
             </div>
          )}
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-lg text-gray-900 leading-tight truncate" title={displayName}>{displayName}</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">Service Provider</p>
        </div>
      </div>
    </div>
  );
}
