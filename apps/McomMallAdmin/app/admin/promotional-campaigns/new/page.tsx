'use client';

import { useRouter } from 'next/navigation';
import PromotionalCampaignForm from '@/app/admin/promotional-campaigns/components/PromotionalCampaignForm';
import { useCreateCampaign } from '@/service/promotional-campaigns/hook';

export default function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();

  return (
    <PromotionalCampaignForm
      isSaving={createCampaign.isPending}
      onSubmit={(payload) =>
        createCampaign.mutate(payload, {
          onSuccess: () => router.push('/admin/promotional-campaigns'),
        })
      }
    />
  );
}
