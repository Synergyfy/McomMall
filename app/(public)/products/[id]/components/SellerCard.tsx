'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { InHouseBusiness } from '@/service/listings/types';

interface SellerCardProps {
  business: Partial<InHouseBusiness> | undefined;
}

export default function SellerCard({ business }: SellerCardProps) {
  if (!business) return null;

  // Prioritize businessName, fallback to user.name if businessName is missing or generic
  const displayName = business.businessName || business.user?.name || 'Seller';
  const ownerName = business.user?.name;

  const logoUrl = business.logoUrl || business.user?.profilePictureUrl;

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
          {ownerName && ownerName !== displayName && (
             <p className="text-sm text-gray-500 mt-1 truncate">{ownerName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
