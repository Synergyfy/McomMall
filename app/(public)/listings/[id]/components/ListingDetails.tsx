
'use client';

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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-2xl text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-2xl text-gray-500">Listing not found</p>
      </div>
    );
  }

  const inHouseListing = listing as InHouseBusiness;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            <HeroSection listing={inHouseListing} />
            <AboutSection listing={inHouseListing} />
            {inHouseListing.media && inHouseListing.media.length > 0 && (
              <MediaGallery media={inHouseListing.media} />
            )}
            {inHouseListing.products && inHouseListing.products.length > 0 && (
              <ProductsSection products={inHouseListing.products} />
            )}
            {inHouseListing.serviceProviderProfile && <ServicesSection />}
            <PromotionsSection />
            <ContactSection listing={inHouseListing} />
          </div>
        </div>
      </div>
    </div>
  );
}
