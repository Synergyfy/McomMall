import GiftCardPurchaseClient from './GiftCardPurchaseClient';

interface GiftCardPurchasePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ templateId?: string }>;
}

export default async function GiftCardPurchasePage({ params, searchParams }: GiftCardPurchasePageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  return <GiftCardPurchaseClient params={resolvedParams} searchParams={resolvedSearchParams} />;
}