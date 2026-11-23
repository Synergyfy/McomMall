'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight, Handshake, Sparkles } from 'lucide-react';
import { RootState } from '@/service/store/store';
import { InHouseBusiness } from '@/service/listings/types';
import { PartnershipRequestDialog } from '@/components/partnership/PartnershipRequestDialog';

interface PartnershipCTAProps {
  listing: InHouseBusiness;
}

/**
 * Shown to signed-in business owners viewing another business's public
 * listing. Customers and the listing owner never see the partnership action.
 */
export default function PartnershipCTA({ listing }: PartnershipCTAProps) {
  const { userId, userRole } = useSelector((state: RootState) => state.auth);
  const [dialogOpen, setDialogOpen] = useState(false);

  const ownerId = listing.user?.id;
  const isBusinessOwner = String(userRole || '').toLowerCase() === 'owner';
  const isOwnListing = Boolean(ownerId && userId && ownerId === userId);

  if (!isBusinessOwner || !ownerId || isOwnListing) return null;

  return (
    <>
      <div className="max-w-[1600px] mx-auto px-8 pt-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-500/20">
              <Handshake className="h-6 w-6" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                <Sparkles className="h-3 w-3" /> B2B Partnership
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                Want to work with {listing.businessName}?
              </h2>
              <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-500">
                Send a partnership request explaining how your businesses can
                grow together.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-black text-white transition-all hover:bg-slate-800 active:scale-95"
          >
            Send Partnership Request <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PartnershipRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetUserId={ownerId}
        businessName={listing.businessName}
      />
    </>
  );
}
