'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PromotionalCampaignForm from '@/app/admin/promotional-campaigns/components/PromotionalCampaignForm';
import {
  useGetCampaign,
  useUpdateCampaign,
} from '@/service/promotional-campaigns/hook';

export default function EditCampaignPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data: campaign, isLoading } = useGetCampaign(id);
  const updateCampaign = useUpdateCampaign();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading campaign…
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Campaign not found.
      </div>
    );
  }

  return (
    <PromotionalCampaignForm
      initial={campaign}
      isSaving={updateCampaign.isPending}
      onSubmit={(payload) =>
        updateCampaign.mutate(
          { id: campaign.id, payload },
          {
            onSuccess: () => router.push('/admin/promotional-campaigns'),
          },
        )
      }
    />
  );
}
