"use client";

import { useGetBusinessGiftCards } from "@/service/gift-card/hook";
import GiftCardFlow from "@/components/gift-card/GiftCardFlow";

interface GiftCardPurchaseClientProps {
  params: { id: string };
  searchParams: { templateId?: string };
}

const GiftCardPurchaseClient = ({
  params,
  searchParams,
}: GiftCardPurchaseClientProps) => {
  const templateId = searchParams.templateId;
  const { data: templates, isPending } = useGetBusinessGiftCards(params.id);

  const selectedTemplate = templates?.find((t) => t.id === templateId);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!selectedTemplate) {
    return <div>Template not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GiftCardFlow template={selectedTemplate} />
    </div>
  );
};

export default GiftCardPurchaseClient;