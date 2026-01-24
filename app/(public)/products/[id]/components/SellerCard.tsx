'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, CheckCircle } from 'lucide-react';
import { InHouseBusiness } from '@/service/listings/types';

interface SellerCardProps {
  business: InHouseBusiness | undefined;
}

export default function SellerCard({ business }: SellerCardProps) {
  if (!business) return null;

  const { businessName, user, logoUrl } = business;
  const userName = user?.name || 'Seller';

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
          {logoUrl ? (
             <Image src={logoUrl} alt={businessName} fill className="object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400">
               <User size={32} />
             </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 leading-tight">{businessName}</h3>
          <p className="text-sm text-gray-500 mt-1">{userName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
        <div>
           <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Trust Score</p>
           <p className="text-sm font-bold text-green-600 mt-1">98%</p>
        </div>
        <div>
           <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Verified Since</p>
           <p className="text-sm font-bold text-gray-900 mt-1">{joinedDate}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="outline" className="w-full justify-center font-medium">
          Connect with Lister
        </Button>
        <Button className="w-full justify-center bg-green-600 hover:bg-green-700 text-white font-medium">
          <MessageCircle className="w-4 h-4 mr-2" />
          Secure Chat
        </Button>
      </div>
    </div>
  );
}
