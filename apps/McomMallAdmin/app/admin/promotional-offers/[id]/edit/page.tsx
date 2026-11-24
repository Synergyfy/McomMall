'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PromotionalOfferForm from '@/app/admin/promotional-offers/components/PromotionalOfferForm';
import {
  useGetPromotionalOffer,
  useUpdatePromotionalOffer,
} from '@/service/promotional-offers/hook';

export default function EditPromotionalOfferPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: offer, isLoading } = useGetPromotionalOffer(id);
  const updateOffer = useUpdatePromotionalOffer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading promotional offer…
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Promotional offer not found.
      </div>
    );
  }

  return (
    <PromotionalOfferForm
      offeringType={offer.offeringType}
      initial={offer}
      isSaving={updateOffer.isPending}
      onSubmit={(payload) =>
        updateOffer.mutate(
          { id: offer.id, payload },
          {
            onSuccess: () => router.push('/admin/promotional-offers'),
          },
        )
      }
    />
  );
}
