import { notFound } from 'next/navigation';
import { getListingById } from '@/lib/listing-data';
import ClientListingDetail from './components/ListingDetails';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <ClientListingDetail placeId={id} />;
}
