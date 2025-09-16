import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Smartphone, Monitor } from 'lucide-react';
import ListingPage from '@/app/listings/[id]/components/ListingPage';
import { ListingFormData } from '../../types';
import { InHouseBusiness } from '@/service/listings/types';

type PreviewListing = Partial<InHouseBusiness>;

interface ListingPreviewProps {
  formData: ListingFormData;
}

const ListingPreview: React.FC<ListingPreviewProps> = ({ formData }) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop'
  );

  const listingDataForPreview: PreviewListing = {
    businessName: formData.businessName,
    categories: [
      { name: formData.serviceData?.tradeCategory || 'Category', id: '', created_at: '', updated_at: '', description: '' },
    ],
    location: {
      addressLine1: formData.address || '',
      city: formData.city || '',
      id: '',
      created_at: '',
      updated_at: '',
      postcode: '',
      addressLine2: '',
      lat: 0,
      lng: 0,
      showPublicly: false,
      deliveryRadiusKm: 0,
      servicePostcodes: [],
      serviceModel: null,
    },
  };

  const imageUrls =
    formData.media && formData.media.length > 0
      ? formData.media
          .map(m => m.url)
          .filter((url): url is string => typeof url === 'string')
      : [
          'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        ];

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
              className={`h-5 w-5 ${
                previewMode === 'mobile' ? '' : 'text-muted-foreground'
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
              className={`h-5 w-5 ${
                previewMode === 'desktop' ? '' : 'text-muted-foreground'
              }`}
            />
          </Button>
        </div>
      </div>
      <div
        className={`p-4 ${
          previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
        }`}
      >
        <div
          className="w-full overflow-hidden rounded-lg"
          style={{
            border: '1px solid #e5e7eb',
          }}
        >
          <ListingPage
            listing={listingDataForPreview as InHouseBusiness}
            isGoogle={false}
            isWishlisted={false}
            handleWishlistToggle={() => {}}
            imageUrls={imageUrls}
            placeId="preview"
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ListingPreview;
