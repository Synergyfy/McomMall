'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetBusinessData } from '@/service/listings/hook';
import MultiStepListingForm from '@/app/dashboard/add-listing/components/MultiStepListingForm';
import { ListingFormData } from '@/app/dashboard/add-listing/types';
import { UserListing } from '@/service/listings/types';

const transformApiDataToFormData = (
  apiData: UserListing
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
    logo: apiData.logoUrl
      ? { file: null, altText: apiData.logoAltText || '' }
      : null,
    banner: apiData.bannerUrl
      ? { file: null, altText: apiData.bannerAltText || '' }
      : null,
  };

  if (apiData.listingType.includes('product')) {
    formData.productData = {
      primaryCategory: apiData.categories[0]?.name || '',
      subCategories: apiData.categories.slice(1).map(c => c.name),
      showAddressPublicly: apiData.location.showPublicly,
      deliveryArea: {
        type: 'radius',
        value: apiData.location.deliveryRadiusKm?.toString() || '',
      },
      // Other product fields are not available on UserListing type
      sellingModes: {
        inStorePickup: false,
        localDelivery: false,
        ukWideShipping: false,
      },
      fulfilmentNotes: '',
      returnsPolicy: '',
      storefrontLinks: {},
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
