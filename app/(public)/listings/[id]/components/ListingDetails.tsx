
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
import Footer from '@/components/Footer';

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
    <div className="min-h-screen bg-gray-50">
      <HeroSection listing={inHouseListing} />

      <div className="bg-white">
        {inHouseListing.media && inHouseListing.media.length > 0 && (
          <MediaGallery media={inHouseListing.media} />
        )}
      </div>

      <div className="bg-gray-100">
        {inHouseListing.products && inHouseListing.products.length > 0 && (
          <ProductsSection products={inHouseListing.products} />
        )}
      </div>

      <div className="bg-white">
        {inHouseListing.serviceProviderProfile && (
          <ServicesSection businessId={inHouseListing.id} />
        )}
      </div>

      <div className="bg-gray-100">
        <PromotionsSection listing={inHouseListing} />
      </div>

      <div className="bg-white">
        <AboutSection listing={inHouseListing} />
      </div>

      <div className="bg-gray-100">
        <ContactSection listing={inHouseListing} />
      </div>
      <Footer />
    </div>
  );
}
