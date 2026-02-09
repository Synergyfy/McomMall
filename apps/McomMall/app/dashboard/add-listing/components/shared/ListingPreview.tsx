
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Smartphone, Monitor } from 'lucide-react';
import { ListingFormData } from '../../types';
import { InHouseBusiness } from '@/service/listings/types';

// Import the new redesigned components
import HeroSection from '@/app/(public)/listings/[id]/components/redesign/HeroSection';
import AboutSection from '@/app/(public)/listings/[id]/components/redesign/AboutSection';
import MediaGallery from '@/app/(public)/listings/[id]/components/redesign/MediaGallery';
import ProductsSection from '@/app/(public)/listings/[id]/components/redesign/ProductsSection';
import ServicesSection from '@/app/(public)/listings/[id]/components/redesign/ServicesSection';
import PromotionsSection from '@/app/(public)/listings/[id]/components/redesign/PromotionsSection';
import ContactSection from '@/app/(public)/listings/[id]/components/redesign/ContactSection';

interface ListingPreviewProps {
  formData: ListingFormData;
}

const ListingPreview: React.FC<ListingPreviewProps> = ({ formData }) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Create a comprehensive listing object for the new components
  const listingDataForPreview: InHouseBusiness = {
    id: 'preview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    listingType: ['product', 'service'],
    businessName: formData.businessName || 'Business Name',
    legalName: formData.legalName || '',
    companyRegistrationNumber: formData.companyRegNo || '',
    vatNumber: formData.vatNo || '',
    shortDescription: formData.shortDesc || 'A short description of the business.',
    about: formData.longDesc || 'About the business...',
    website: formData.socials?.website || '',
    businessPhone: formData.phone || '',
    businessEmail: formData.email || '',
    logoUrl: formData.logo?.url || '/placeholder-logo.png',
    bannerUrl: formData.banner?.url || '/placeholder-banner.png',
    logoAltText: formData.logo?.altText || '',
    bannerAltText: formData.banner?.altText || '',
    media: formData.media?.map(m => m.url).filter((url): url is string => !!url) || [],
    status: 'draft',
    isGoogleVerified: false,
    isVerified: true,
    isClaimed: true,
    location: {
      id: '',
      createdAt: '',
      updatedAt: '',
      postcode: formData.postcode || '',
      addressLine1: formData.address || 'Address Line 1',
      addressLine2: '',
      city: formData.city || 'City',
      lat: 0,
      lng: 0,
      showPublicly: true,
      deliveryRadiusKm: 0,
      servicePostcodes: [],
      serviceModel: 'at_location',
    },
    categories: formData.serviceData?.tradeCategory ? [{ id: 'cat1', name: formData.serviceData.tradeCategory, createdAt: '', updatedAt: '', description: null }] : [],
    socialLinks: [
      { id: 'fb', platform: 'facebook', url: formData.socials?.facebook || '' },
      { id: 'tw', platform: 'twitter', url: formData.socials?.twitter || '' },
      { id: 'ig', platform: 'instagram', url: formData.socials?.instagram || '' },
      { id: 'li', platform: 'linkedin', url: formData.socials?.linkedin || '' },
    ].filter(link => link.url),
    businessHours: [],
    specialDays: [],
    products: [],
    campaigns: [],
    user: {
      id: '',
      createdAt: '',
      updatedAt: '',
      name: '',
      email: '',
      phoneNumber: '',
      isActive: true,
      isEmailVerified: true,
      role: 'owner',
      giftCard: true,
      voucher: true,
      promotion: true,
    },
    giftCard: true,
    voucher: true,
    promotion: true,
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Live Preview</h3>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-muted p-1">
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
            className="p-2"
          >
            <Smartphone
              className={`h-5 w-5 ${previewMode === 'mobile' ? '' : 'text-muted-foreground'
                }`}
            />
          </Button>
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
            className="p-2"
          >
            <Monitor
              className={`h-5 w-5 ${previewMode === 'desktop' ? '' : 'text-muted-foreground'
                }`}
            />
          </Button>
        </div>
      </div>
      <div
        className={`bg-gray-100 p-4 transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
          }`}
      >
        <div
          className="w-full overflow-hidden rounded-lg border"
        >
          {/* Using the new redesigned layout */}
          <div className="space-y-8 p-4">
            <HeroSection listing={listingDataForPreview} />
            <AboutSection listing={listingDataForPreview} />
            {listingDataForPreview.media.length > 0 && (
              <MediaGallery media={listingDataForPreview.media} />
            )}
            {listingDataForPreview.products.length > 0 && (
              <ProductsSection products={listingDataForPreview.products} />
            )}
            <ServicesSection businessId={listingDataForPreview.id} />
            <PromotionsSection listing={listingDataForPreview} />
            <ContactSection listing={listingDataForPreview} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPreview;
