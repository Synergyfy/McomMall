'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetBusinessData } from '@/service/listings/hook';
import MultiStepListingForm from '@/app/dashboard/add-listing/components/MultiStepListingForm';
import { ListingFormData, WeeklyHours } from '@/app/dashboard/add-listing/types';
import { InHouseBusiness, BusinessHour } from '@/service/listings/types';

const transformApiDataToFormData = (
  apiData: InHouseBusiness
): Partial<ListingFormData> => {
  const findSocial = (platform: string) =>
    apiData.socialLinks.find(
      s => s.platform.toLowerCase() === platform.toLowerCase()
    )?.url;

  const mapWeeklyHours = (hours: BusinessHour[]) => {
    const dayMap: Record<string, keyof WeeklyHours> = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
      'SATURDAY': 'Saturday',
      'SUNDAY': 'Sunday',
    };
    return hours.reduce((acc, curr) => {
      const day = dayMap[curr.dayOfWeek];
      if (day) {
        if (!acc[day]) acc[day] = [];
        acc[day]!.push({ start: curr.openTime, end: curr.closeTime });
      }
      return acc;
    }, {} as WeeklyHours);
  };

  const formData: Partial<ListingFormData> = {
    id: apiData.id,
    status: (apiData.status?.toLowerCase() || 'published') as ListingFormData['status'],
    businessTypes: apiData.listingType.map(
      t => (t.charAt(0).toUpperCase() + t.slice(1)) as 'Product' | 'Service'
    ),
    businessName: apiData.businessName,
    legalName: apiData.legalName,
    companyRegNo: apiData.companyRegistrationNumber || '',
    vatNo: apiData.vatNumber || '',
    shortDesc: apiData.shortDescription,
    longDesc: apiData.about || '',
    address: apiData.location.addressLine1,
    postcode: apiData.location.postcode,
    city: apiData.location.city,
    phone: apiData.businessPhone,
    email: apiData.businessEmail || '',
    socials: {
      website: apiData.website || '',
      facebook: findSocial('facebook') || '',
      instagram: findSocial('instagram') || '',
      twitter: findSocial('twitter') || '',
      youtube: findSocial('youtube') || '',
      linkedin: findSocial('linkedin') || '',
    },
    logo: apiData.logoUrl
      ? { url: apiData.logoUrl, altText: apiData.logoAltText || '' }
      : null,
    banner: apiData.bannerUrl
      ? { url: apiData.bannerUrl, altText: apiData.bannerAltText || '' }
      : null,
    media: apiData.media.map(url => ({
      url,
      altText: '',
    })),
  };

  const hasProduct = apiData.listingType.includes('RETAIL');
  const hasService = apiData.listingType.includes('SERVICE');

  if (hasProduct) {
    formData.productData = {
      primaryCategory: apiData.categories[0]?.id || '',
      subCategory: apiData.categories[1]?.id || '',
      subCategories: apiData.categories.slice(2).map(c => c.id),
      showAddressPublicly: apiData.location.showPublicly,
      deliveryArea: {
        type: apiData.location.deliveryRadiusKm ? 'radius' : 'postcodes',
        value: apiData.location.deliveryRadiusKm
          ? apiData.location.deliveryRadiusKm.toString()
          : apiData.location.servicePostcodes || [],
      },
      sellingModes: {
        inStorePickup: !!apiData.productSellerProfile?.sellingModes.includes('pickup'),
        localDelivery: !!apiData.productSellerProfile?.sellingModes.includes('local_delivery'),
        ukWideShipping: !!apiData.productSellerProfile?.sellingModes.includes('uk_shipping'),
      },
      fulfilmentNotes: apiData.productSellerProfile?.fulfilmentNotes || '',
      returnsPolicy: apiData.productSellerProfile?.returnsPolicy || '',
      hasAgeRestrictedItems: apiData.productSellerProfile?.hasAgeRestrictedItems || false,
      storefrontLinks: apiData.productSellerProfile?.storefrontLinks.map(link => ({
        name: link.platform,
        url: link.url,
      })) || [],
      is247: apiData.businessHours.every(h => h.is24h),
      weeklyHours: mapWeeklyHours(apiData.businessHours),
      specialDays: apiData.specialDays.map(sd => ({
        date: new Date(sd.date),
        isClosed: !sd.isOpen,
        openingHours: sd.openTime && sd.closeTime ? [{ start: sd.openTime, end: sd.closeTime }] : undefined,
      })),
    };
  }

  if (hasService) {
    formData.serviceData = {
      primaryCategory: apiData.categories[0]?.id || '',
      tradeCategory: apiData.categories[1]?.id || apiData.categories[0]?.id || '',
      subCategories: apiData.categories.slice(2).map(c => c.id),
      serviceLocation: {
        atBusinessLocation: apiData.location.serviceModel !== 'travel_to_customer',
        customerTravels: apiData.location.serviceModel !== 'at_location',
      },
      serviceArea: {
        type: apiData.location.deliveryRadiusKm ? 'radius' : 'postcodes',
        value: apiData.location.deliveryRadiusKm
          ? apiData.location.deliveryRadiusKm.toString()
          : (apiData.location.servicePostcodes || []).join(', '),
      },
      hoursType: apiData.serviceProviderProfile?.bookingMethod === 'book_online' ? 'weekly' : 'appointmentOnly',
      weeklyHours: mapWeeklyHours(apiData.businessHours),
      bookingMethod: apiData.serviceProviderProfile?.bookingMethod === 'book_online' ? 'online' : apiData.serviceProviderProfile?.bookingMethod === 'request_a_quote' ? 'quote' : 'call',
      bookingURL: apiData.serviceProviderProfile?.bookingUrl || '',
      pricingVisibility: apiData.serviceProviderProfile?.quoteOnly ? 'quote' : 'fixed',
      hasPublicLiabilityInsurance: apiData.serviceProviderProfile?.hasPublicLiabilityInsurance || false,
      insuranceCertificates: [], // API doesn't seem to separate insurance from certs cleanly in the simplified profile, but we expect Media[]
      qualifications: apiData.serviceProviderProfile?.certifications.map(c => ({
        url: c.fileUrl,
        altText: c.name,
      })) || [],
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
