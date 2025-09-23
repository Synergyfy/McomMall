'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetBusinessData } from '@/service/listings/hook';
import MultiStepListingForm from '@/app/dashboard/add-listing/components/MultiStepListingForm';
import { ListingFormData } from '@/app/dashboard/add-listing/types';
import { InHouseBusiness } from '@/service/listings/types';

const transformApiDataToFormData = (
  apiData: InHouseBusiness
): Partial<ListingFormData> => {
  const formData: Partial<ListingFormData> = {
    businessTypes: apiData.listingType.map(
      t => t.charAt(0).toUpperCase() + t.slice(1)
    ) as ('Product' | 'Service')[],
    businessName: apiData.businessName,
    phone: apiData.businessPhone,
    email: apiData.businessEmail,
    shortDesc: apiData.shortDescription,
    socials: {
      website: apiData.website,
      // The UserListing type doesn't include other social media links.
      // They would need to be added to the type and fetched from the API
      // to be populated here.
    },
    media: [], // This needs to be populated from the API, assuming the API provides a list of media URLs.
  };

  const mediaItems = [];
  if (apiData.logoUrl) {
    mediaItems.push({ url: apiData.logoUrl, altText: apiData.logoAltText || '' });
  }
  if (apiData.bannerUrl) {
    mediaItems.push({ url: apiData.bannerUrl, altText: apiData.bannerAltText || '' });
  }
  formData.media = mediaItems;

  if (apiData.listingType.includes('product')) {
    formData.productData = {
      primaryCategory: apiData.categories[0]?.name || '',
      subCategories: apiData.categories.slice(1).map(c => c.name),
      showAddressPublicly: apiData.location.showPublicly,
      deliveryArea: {
        type: 'radius',
        value: apiData.location.deliveryRadiusKm?.toString() || '',
      },
      sellingModes: {
        inStorePickup:
          apiData.productSellerProfile?.sellingModes.includes('pickup') ||
          false,
        localDelivery:
          apiData.productSellerProfile?.sellingModes.includes(
            'local_delivery'
          ) || false,
        ukWideShipping:
          apiData.productSellerProfile?.sellingModes.includes('uk_shipping') ||
          false,
      },
      fulfilmentNotes: apiData.productSellerProfile?.fulfilmentNotes || '',
      returnsPolicy: apiData.productSellerProfile?.returnsPolicy || '',
      storefrontLinks:
        apiData.productSellerProfile?.storefrontLinks.map(link => ({
          name: link.platform,
          url: link.url,
        })) || [],
    };
  }

  if (apiData.listingType.includes('service')) {
    formData.serviceData = {
      tradeCategory: apiData.categories[0]?.name || '',
      serviceLocation: {
        atBusinessLocation: apiData.location.serviceModel !== 'travel_to_customer',
        customerTravels: apiData.location.serviceModel !== 'at_location',
      },
      serviceArea: { type: 'postcodes', value: apiData.location.servicePostcodes?.join(', ') || '' },
      // Other service fields are not available on UserListing type
      hoursType: 'weekly',
      bookingMethod: 'call',
      pricingVisibility: 'quote',
    };
  }

  return formData;
};

const EditListingPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const listingId = id as string;

  const {
    data: listingData,
    isLoading,
    isError,
  } = useGetBusinessData({ id: listingId });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading listing data.</div>;
  if (!listingData) return <div>Listing not found.</div>;

  const initialData = transformApiDataToFormData(listingData);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <MultiStepListingForm
        businessTypes={initialData.businessTypes || []}
        onBack={() => router.push('/dashboard/my-listings')}
        listingId={listingId}
        initialData={initialData}
      />
    </div>
  );
};

export default EditListingPage;
