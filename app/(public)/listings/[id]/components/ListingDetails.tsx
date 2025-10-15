
'use client';

import { useSearchParams } from 'next/navigation';
import { useGetBusinessData } from '@/service/listings/hook';
import { InHouseBusiness } from '@/service/listings/types';
import HeroSection from './redesign/HeroSection';
import AboutSection from './redesign/AboutSection';
import MediaGallery from './redesign/MediaGallery';
import ProductsSection from './redesign/ProductsSection';
import ServicesSection from './redesign/ServicesSection';
import PromotionsSection from './redesign/PromotionsSection';
import ContactSection from './redesign/ContactSection';

type ClientListingDetailProps = {
  placeId: string;
};

export default function ClientListingDetail({
  placeId,
}: ClientListingDetailProps) {
  const {
    data: listing,
    isLoading,
  } = useGetBusinessData({
    id: placeId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl">Listing not found</p>
      </div>
    );
  }

  // Since the redesign is focused on in-house listings, we cast the type.
  const inHouseListing = listing as InHouseBusiness;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <HeroSection listing={inHouseListing} />
          <AboutSection listing={inHouseListing} />
          {inHouseListing.media && inHouseListing.media.length > 0 && (
            <MediaGallery media={inHouseListing.media} />
          )}
          {inHouseListing.products && inHouseListing.products.length > 0 && (
            <ProductsSection products={inHouseListing.products} />
          )}
          <ServicesSection />
          <PromotionsSection />
          <ContactSection listing={inHouseListing} />
        </div>
      </div>
    </div>
  );
}
