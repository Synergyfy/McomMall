"use client";

import { useGetBusinessGiftCards } from "@/service/gift-card/hook";
import NewGiftCardFlow from "@/components/gift-card/NewGiftCardFlow";

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!selectedTemplate) {
    return <div className="flex justify-center items-center h-screen">Template not found</div>;
  }

  return <NewGiftCardFlow template={selectedTemplate} />;
};

export default GiftCardPurchaseClient;