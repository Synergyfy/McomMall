"use client";

import { useGetBusinessGiftCards } from "@/service/gift-card/hook";
import PurchaseForm from "./components/PurchaseForm";

interface GiftCardPurchaseClientProps {
  params: { id: string };
  searchParams: { templateId?: string };
}

const GiftCardPurchaseClient = ({ params, searchParams }: GiftCardPurchaseClientProps) => {
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
      <h1 className="text-3xl font-bold text-center mb-8 text-orange-600">
        Purchase Gift Card
      </h1>
      <PurchaseForm template={selectedTemplate} />
    </div>
  );
};

export default GiftCardPurchaseClient;