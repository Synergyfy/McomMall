'use client';

import { useRouter } from 'next/navigation';
import PromotionalOfferForm from '@/app/admin/promotional-offers/components/PromotionalOfferForm';
import { useCreatePromotionalOffer } from '@/service/promotional-offers/hook';

export default function NewPromotionalProductPage() {
  const router = useRouter();
  const createOffer = useCreatePromotionalOffer();

  return (
    <PromotionalOfferForm
      offeringType="product"
      isSaving={createOffer.isPending}
      onSubmit={(payload) =>
        createOffer.mutate(payload, {
          onSuccess: () => router.push('/admin/promotional-offers'),
        })
      }
    />
  );
}
