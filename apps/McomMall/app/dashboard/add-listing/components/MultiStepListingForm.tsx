'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Save,
  ArrowLeft,
  ArrowRight,
  Store,
  Check,
  Loader2,
  Building2,
  LayoutGrid,
  MapPin,
  Clock,
  Wrench,
  Map,
  CalendarDays,
  Award,
  Camera,
} from 'lucide-react';
import {
  isNotEmpty,
  isLength,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from '@/lib/validation';
import {
  CreateBusinessPayload,
  ListingType,
  SocialLinkPayload,
  DayOfWeek,
  BusinessHourPayload,
  SpecialDayPayload,
  ProductSellerProfilePayload,
  ServiceProviderProfilePayload,
  SellingMode,
  StorefrontLinkPayload,
} from '@/service/listings/types';
import { ListingFormData } from '../types';
import { uploadFile } from '@/lib/upload';
import { InProgressDialog } from '@/components/InProgressDialog';
import { UploadSuccessDialog } from '@/components/UploadSuccessDialog';
import { ErrorDialog } from '@/components/ErrorDialog';
import { useAddListing, useEditListing } from '@/service/listings/hook';
import { toast } from 'sonner';
import ListingUsageBar from '@/components/dashboard/ListingUsageBar';

// Import all step components
import BusinessInfoStep from './steps/shared/BusinessInfoStep';
import MediaStep from './steps/shared/MediaStep';
import ProductCategoryStep from './steps/product/ProductCategoryStep';
import ProductLocationStep from './steps/product/ProductLocationStep';
import ProductHoursStep from './steps/product/ProductHoursStep';
import SellingModesStep from './steps/product/SellingModesStep';
import ServiceCategoryStep from './steps/service/ServiceCategoryStep';
import ServiceAreaStep from './steps/service/ServiceAreaStep';
import ServiceHoursStep from './steps/service/ServiceHoursStep';
// BookingStep removed from flow per new requirements
import CredentialsStep from './steps/service/CredentialsStep';

interface MultiStepListingFormProps {
  businessTypes: string[];
  onBack: () => void;
  listingId?: string;
  initialData?: Partial<ListingFormData>;
}

// Validation rules definition
const validationRules = {
  businessInfo: {
    businessName: {
      validate: isNotEmpty,
      message: 'Business name is required.',
    },
    address: {
      validate: isNotEmpty,
      message: 'Address is required.',
    },
    city: {
      validate: isNotEmpty,
      message: 'City is required.',
    },
    postcode: {
      validate: isNotEmpty,
      message: 'Postcode is required.',
    },
    shortDesc: {
      validate: (v: string) => isLength(v, { min: 20, max: 180 }),
      message: 'Must be 20-180 characters.',
    },
    phone: {
      validate: isValidPhone,
      message: 'Invalid phone number.',
    },
    email: {
      validate: isValidEmail,
      message: 'Invalid email address.',
      optional: true,
    },
    'socials.website': {
      validate: isValidUrl,
      message: 'A valid website URL is required.',
      optional: true,
    },
    'socials.facebook': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
    'socials.instagram': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
    'socials.twitter': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
    'socials.youtube': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
    'socials.linkedin': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
  },
  media: {
    media: {
      validate: (media: unknown[]) => media.length > 0,
      message: 'At least one image or video is required.',
    },
  },
  productCategory: {
    'productData.primaryCategory': {
      validate: isNotEmpty,
      message: 'Primary category is required.',
    },
    'productData.subCategory': {
      validate: isNotEmpty,
      message: 'Category is required.',
    },
    'productData.subCategories': {
      validate: (v: string[]) => v.length > 0,
      message: 'Sub-category is required.',
    },
  },
  productLocation: {},
  sellingModes: {
    'productData.sellingModes': {
      validate: (modes: { [s: string]: boolean }) =>
        Object.values(modes).some(v => v),
      message: 'At least one selling mode must be selected.',
    },
  },
  serviceCategory: {
    'serviceData.primaryCategory': {
      validate: isNotEmpty,
      message: 'Sector is required.',
    },
    'serviceData.tradeCategory': {
      validate: isNotEmpty,
      message: 'Trade category is required.',
    },
    'serviceData.subCategories': {
      validate: (v: string[]) => (v?.length || 0) > 0,
      message: 'Sub-category is required.',
    },
  },
  booking: {},
};

// StepIndicator component removed as it is now inlined

const MultiStepListingForm: React.FC<MultiStepListingFormProps> = ({
  businessTypes,
  onBack,
  listingId,
  initialData: propInitialData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [formData, setFormData] = useState<ListingFormData>(() => {
    const initialData: ListingFormData = {
      status: 'draft',
      businessTypes: businessTypes as ('Product' | 'Service')[],
      businessName: '',
      phone: '',
      email: '',
      shortDesc: '',
      socials: { website: '' },
      media: [],
      ...propInitialData,
    };
    if (businessTypes.includes('Product') && !initialData.productData) {
      initialData.productData = {
        primaryCategory: '',
        subCategories: [],
        showAddressPublicly: true,
        deliveryArea: { type: 'radius', value: '' },
        sellingModes: {
          inStorePickup: false,
          localDelivery: false,
          ukWideShipping: false,
        },
        fulfilmentNotes: '',
        returnsPolicy: '',
        storefrontLinks: [],
      };
    }
    if (businessTypes.includes('Service') && !initialData.serviceData) {
      initialData.serviceData = {
        primaryCategory: '',
        tradeCategory: '',
        serviceLocation: {
          atBusinessLocation: false,
          customerTravels: false,
        },
        serviceArea: { type: 'radius', value: '' },
        hoursType: 'weekly',
        pricingVisibility: 'quote',
      };
    }
    return initialData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: addListing, isPending: isAdding } = useAddListing();
  const { mutate: editListing, isPending: isEditing } = useEditListing();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPending = isAdding || isEditing || isUploading;

  const steps = useMemo(() => {
    const sharedInitial = [
      {
        title: 'Business Info',
        icon: Building2,
        component: BusinessInfoStep,
        validationRules: validationRules.businessInfo,
        section: 'Business Info',
      },
    ];
    const productSteps = [
      {
        title: 'Product Categories',
        icon: LayoutGrid,
        component: ProductCategoryStep,
        validationRules: validationRules.productCategory,
        section: 'Product Details',
      },
      {
        title: 'Location',
        icon: MapPin,
        component: ProductLocationStep,
        validationRules: validationRules.productLocation,
        section: 'Product Details',
      },
      {
        title: 'Hours',
        icon: Clock,
        component: ProductHoursStep,
        validationRules: {},
        section: 'Product Details',
      },
      {
        title: 'Selling Modes',
        icon: Store,
        component: SellingModesStep,
        validationRules: validationRules.sellingModes,
        section: 'Product Details',
      },
    ];
    const serviceSteps = [
      {
        title: 'Service Categories',
        icon: Wrench,
        component: ServiceCategoryStep,
        validationRules: validationRules.serviceCategory,
        section: 'Service Details',
      },
      {
        title: 'Service Area',
        icon: Map,
        component: ServiceAreaStep,
        validationRules: {},
        section: 'Service Details',
      },
      {
        title: 'Availability',
        icon: CalendarDays,
        component: ServiceHoursStep,
        validationRules: {},
        section: 'Service Details',
      },
      {
        title: 'Credentials',
        icon: Award,
        component: CredentialsStep,
        validationRules: {},
        section: 'Service Details',
      },
    ];
    const sharedFinal = [
      {
        title: 'Media',
        icon: Camera,
        component: MediaStep,
        validationRules: validationRules.media,
        section: 'Media & Finalize',
      },
    ];

    let flowSteps: {
      title: string;
      icon: React.ElementType;
      component: React.ElementType;
      validationRules: object;
      section: string;
    }[] = [];

    if (
      businessTypes.includes('Product') &&
      businessTypes.includes('Service')
    ) {
      flowSteps = [...productSteps, ...serviceSteps];
    } else if (businessTypes.includes('Product')) {
      flowSteps = productSteps;
    } else if (businessTypes.includes('Service')) {
      flowSteps = serviceSteps;
    }

    return [...sharedInitial, ...flowSteps, ...sharedFinal];
  }, [businessTypes, businessTypes]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValueByPath = (obj: any, path: string) => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined;
      }
      result = result[key];
    }
    return result;
  };

  const validateStep = () => {
    const currentRules = steps[currentStep - 1].validationRules as Record<
      string,
      {
        validate: (value: unknown) => boolean;
        message: string;
        optional?: boolean;
      }
    >;
    const newErrors: Record<string, string> = {};

    for (const fieldName in currentRules) {
      const rule = currentRules[fieldName];
      const value = getValueByPath(formData, fieldName);


      // Conditional validation for booking URL
      if (
        fieldName === 'serviceData.bookingURL' &&
        formData.serviceData?.bookingMethod !== 'online'
      ) {
        continue;
      }

      if (
        rule.optional &&
        (value === undefined || value === null || value === '')
      ) {
        continue;
      }

      if (!rule.validate(value)) {
        newErrors[fieldName] = rule.message;
      }
    }

    // Custom validation for storefront links
    if (formData.productData?.storefrontLinks) {
      formData.productData.storefrontLinks.forEach((link, index) => {
        if (link.name && !link.url) {
          newErrors[`productData.storefrontLinks[${index}].url`] =
            'URL is required if name is provided.';
        } else if (link.url && !link.name) {
          newErrors[`productData.storefrontLinks[${index}].name`] =
            'Name is required if URL is provided.';
        } else if (link.url && !isValidUrl(link.url)) {
          newErrors[`productData.storefrontLinks[${index}].url`] =
            'Invalid URL format.';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to any step without immediate validation
    setCurrentStep(stepIndex);
  };

  const nextStep = () => {
    if (validateStep()) {
      const nextIdx = currentStep; // 1-indexed, so currentStep is the index of the next step
      if (nextIdx < steps.length) {
        const currentSection = steps[currentStep - 1].section;
        const nextSection = steps[nextIdx].section;

        if (currentSection === 'Product Details' && nextSection === 'Service Details') {
          toast.success('Product details completed! Now moving to Service details.', {
            description: 'You are now in the service section.',
            duration: 4000,
          });
        }

        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const transformFormDataToPayload = (
    data: ListingFormData,
    statusOverride: 'published' | 'draft' = 'published'
  ): CreateBusinessPayload => {
    console.log('--- START transformFormDataToPayload ---');
    console.log('Input data.businessTypes:', data.businessTypes);

    const mappedListingTypes: ListingType[] = data.businessTypes.map(t => {
      const typeStr = String(t).toLowerCase();
      if (typeStr === 'product' || typeStr === 'retail') return 'RETAIL';
      if (typeStr === 'service') return 'SERVICE';
      return 'RETAIL';
    });

    console.log('Mapped listingType:', mappedListingTypes);

    const formatUrl = (url?: string): string | undefined => {
      if (!url) return undefined;
      const trimmed = url.trim();
      if (!trimmed) return undefined;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      return `https://${trimmed}`;
    };

    // Helper to strip empty values
    const stripEmpty = <T extends object>(obj: T): T => {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key as keyof T] = value;
        }
        return acc;
      }, {} as T);
    };

    // --- Location and Service Area ---
    const location: CreateBusinessPayload['location'] = stripEmpty({
      addressLine1: data.address || '',
      postcode: data.postcode || '',
      city: data.city || '',
      showPublicly: data.productData?.showAddressPublicly || false,
      deliveryRadiusKm:
        data.productData?.deliveryArea?.type === 'radius'
          ? Number(data.productData.deliveryArea.value)
          : undefined,
      servicePostcodes:
        data.productData?.deliveryArea?.type === 'postcodes'
          ? (data.productData.deliveryArea.value as string[])
          : data.serviceData?.serviceArea?.type === 'postcodes'
            ? data.serviceData.serviceArea.value.split(',').map(p => p.trim())
            : undefined,
      serviceModel:
        data.serviceData?.serviceLocation?.atBusinessLocation &&
          data.serviceData?.serviceLocation?.customerTravels
          ? 'HYBRID'
          : data.serviceData?.serviceLocation?.atBusinessLocation
            ? 'AT_LOCATION'
            : data.serviceData?.serviceLocation?.customerTravels
              ? 'TRAVEL_TO_CUSTOMER'
              : undefined,
    });

    // --- Social Links ---
    const socialLinks: SocialLinkPayload[] = Object.entries(data.socials)
      .map(([platform, url]) => {
        const formattedUrl = formatUrl(url);
        return formattedUrl ? { platform, url: formattedUrl } : null;
      })
      .filter((link): link is SocialLinkPayload => link !== null);

    // --- Business Hours ---
    const dayMapping: { [key: string]: DayOfWeek } = {
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
      Sunday: 'SUNDAY',
    };
    const businessHours: BusinessHourPayload[] = [];
    if (data.productData?.weeklyHours) {
      for (const [day, times] of Object.entries(data.productData.weeklyHours)) {
        if (times) {
          (times as { start: string; end: string }[]).forEach(time => {
            businessHours.push({
              dayOfWeek: dayMapping[day],
              openTime: time.start,
              closeTime: time.end,
            });
          });
        }
      }
    }

    // --- Special Days ---
    const specialDays: SpecialDayPayload[] =
      data.productData?.specialDays?.map(day => ({
        date: day.date.toISOString().split('T')[0],
        description: '', // No description field in source
        isOpen: !day.isClosed,
        openTime: day.openingHours?.[0]?.start,
        closeTime: day.openingHours?.[0]?.end,
      })) || [];

    // --- Product Seller Profile ---
    let productSellerProfile: ProductSellerProfilePayload | undefined;
    if (data.productData) {
      const sellingModes: SellingMode[] = [];
      if (data.productData.sellingModes?.inStorePickup)
        sellingModes.push('pickup');
      if (data.productData.sellingModes?.localDelivery)
        sellingModes.push('local_delivery');
      if (data.productData.sellingModes?.ukWideShipping)
        sellingModes.push('uk_shipping');

      const storefrontLinks: StorefrontLinkPayload[] = (
        data.productData.storefrontLinks || []
      )
        .map(link => {
          if (link.name && link.url) {
            const formattedUrl = formatUrl(link.url);
            return formattedUrl
              ? {
                platform: link.name as any,
                url: formattedUrl,
              }
              : null;
          }
          return null;
        })
        .filter(
          (link): link is StorefrontLinkPayload =>
            link !== null && link.url !== undefined
        );

      productSellerProfile = stripEmpty({
        sellingModes,
        fulfilmentNotes: data.productData.fulfilmentNotes,
        returnsPolicy: data.productData.returnsPolicy,
        hasAgeRestrictedItems: !!data.productData.hasAgeRestrictedItems,
        storefrontLinks: storefrontLinks.length > 0 ? storefrontLinks : undefined,
      });
    }

    // --- Service Provider Profile ---
    let serviceProviderProfile: ServiceProviderProfilePayload | undefined;
    if (data.serviceData) {
      serviceProviderProfile = stripEmpty({
        bookingUrl: formatUrl(data.serviceData.bookingURL),
        quoteOnly: data.serviceData.pricingVisibility === 'quote',
        hasPublicLiabilityInsurance:
          !!data.serviceData.hasPublicLiabilityInsurance,
        certifications: data.serviceData.qualifications?.map(q => ({
          name: q.altText || 'Certification',
          fileUrl: q.url || '',
        })).filter(c => c.fileUrl),
      });
    }

    const payload: CreateBusinessPayload = stripEmpty({
      media: [],
      listingType: mappedListingTypes,
      businessName: data.businessName,
      legalName: data.legalName,
      companyRegistrationNumber: data.companyRegNo,
      vatNumber: data.vatNo,
      shortDescription: data.shortDesc,
      about: data.longDesc,
      website: formatUrl(data.socials.website),
      businessPhone: data.phone,
      businessEmail: data.email,
      location,
      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      sectorId: (data.productData?.primaryCategory || data.serviceData?.primaryCategory || ''),
      categoryId: (data.productData?.subCategory || data.serviceData?.tradeCategory || ''),
      subCategoryId: (data.productData?.subCategories?.[0] || data.serviceData?.subCategories?.[0] || ''),
      status: statusOverride as any,
      categoryIds: [
        ...(mappedListingTypes.includes('RETAIL')
          ? [
            data.productData?.primaryCategory,
            data.productData?.subCategory,
            data.productData?.subCategories?.[0],
          ]
          : []),
        ...(mappedListingTypes.includes('SERVICE')
          ? [
            data.serviceData?.primaryCategory,
            data.serviceData?.tradeCategory,
            data.serviceData?.subCategories?.[0],
          ]
          : []),
      ]
        .filter((id): id is string => !!id)
        .filter((id, index, self) => self.indexOf(id) === index),
      businessHours: businessHours.length > 0 ? businessHours : undefined,
      specialDays: specialDays.length > 0 ? specialDays : undefined,
      productSellerProfile,
      serviceProviderProfile,
    });

    console.log('TRANSFORMED PAYLOAD:', payload);
    return payload;
  };

  const validateAllSteps = () => {
    const newErrors: Record<string, string> = {};
    let firstErrorStep: number | null = null;

    steps.forEach((step, index) => {
      const rules = step.validationRules as Record<
        string,
        {
          validate: (value: unknown) => boolean;
          message: string;
          optional?: boolean;
        }
      >;
      for (const fieldName in rules) {
        // Stop checking if we already have an error for this field from a previous step's rules
        if (newErrors[fieldName]) continue;

        const rule = rules[fieldName];
        const value = getValueByPath(formData, fieldName);

        if (
          fieldName === 'serviceData.bookingURL' &&
          formData.serviceData?.bookingMethod !== 'online'
        )
          continue;

        if (
          rule.optional &&
          (value === undefined || value === null || value === '')
        ) {
          continue;
        }

        if (!rule.validate(value)) {
          newErrors[fieldName] = rule.message;
          if (firstErrorStep === null) {
            firstErrorStep = index + 1;
          }
        }
      }
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, firstErrorStep };
  };

  const handleSubmit = async (status: 'published' | 'draft' = 'published') => {
    console.log('--- START handleSubmit ---');
    const { isValid, firstErrorStep } = validateAllSteps();
    if (!isValid && status === 'published') {
      console.log('Validation FAILED at step:', firstErrorStep);
      if (firstErrorStep !== null) {
        setCurrentStep(firstErrorStep);
      }
      return;
    }

    setIsUploading(true);
    let uploadedFiles: { secure_url: string; public_id: string }[] = [];

    const deepDiff = (obj1: any, obj2: any): any => {
      const diff: any = {};
      Object.keys(obj1).forEach(key => {
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (val1 && typeof val1 === 'object' && !Array.isArray(val1)) {
          if (val2 && typeof val2 === 'object') {
            const nestedDiff = deepDiff(val1, val2);
            if (Object.keys(nestedDiff).length > 0) {
              diff[key] = nestedDiff;
            }
          } else {
            diff[key] = val1;
          }
        } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          diff[key] = val1;
        }
      });
      return diff;
    };

    try {
      // Wrap upload and mutation in a promise
      await new Promise<void>(async (resolve, reject) => {
        try {
          const uploadPromises = formData.media
            .filter(media => media.file)
            .map(media => uploadFile(media.file as File));

          const logoPromise = formData.logo?.file ? uploadFile(formData.logo.file) : Promise.resolve(undefined);
          const bannerPromise = formData.banner?.file ? uploadFile(formData.banner.file) : Promise.resolve(undefined);

          const [mediaResults, logoResult, bannerResult] = await Promise.all([
            Promise.all(uploadPromises),
            logoPromise,
            bannerPromise,
          ]);

          uploadedFiles = [...mediaResults, logoResult, bannerResult].filter(Boolean) as { secure_url: string; public_id: string }[];

          const fullPayload = transformFormDataToPayload(formData, status);

          // Inject uploaded URLs
          fullPayload.media = [
            ...formData.media.filter(m => m.url).map(m => m.url!),
            ...mediaResults.map(r => r.secure_url)
          ];
          if (logoResult) fullPayload.logoUrl = logoResult.secure_url;
          if (bannerResult) fullPayload.bannerUrl = bannerResult.secure_url;

          let finalPayload: any = fullPayload;
          console.log('Final Prepared Payload:', JSON.stringify(finalPayload, null, 2));

          // Partial update logic if editing
          if (listingId && propInitialData) {
            console.log('Calculating diff for editing...');
            const initialPayload = transformFormDataToPayload(propInitialData as any);
            const diffPayload = deepDiff(fullPayload, initialPayload);

            // Strategy: always send listingType and businessName for context if available
            diffPayload.listingType = fullPayload.listingType;
            diffPayload.businessName = fullPayload.businessName;
            diffPayload.status = status; // Ensure status reflects draft/published

            finalPayload = diffPayload;
            console.log('Diff Payload:', JSON.stringify(finalPayload, null, 2));
          }

          if (listingId) {
            editListing({ listingId, payload: finalPayload }, {
              onSuccess: () => {
                setUploadSuccess(true);
                resolve();
              },
              onError: (err: any) => {
                setErrorMessage(err.message || 'An error occurred during update.');
                setUploadError(true);
                reject(err);
              },
            });
          } else {
            addListing(finalPayload, {
              onSuccess: () => {
                setUploadSuccess(true);
                resolve();
              },
              onError: (err: any) => {
                setErrorMessage(err.message || 'An error occurred during submission.');
                setUploadError(true);
                reject(err);
              },
            });
          }
        } catch (uploadError) {
          setErrorMessage('File upload failed. Please try again.');
          setUploadError(true);
          reject(uploadError);
        }
      });
    } catch {
      // This catch block will handle the rejection from the promise
      if (uploadedFiles.length > 0) {
        await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_ids: uploadedFiles.map(f => f.public_id) }),
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) return null;

  const getTitle = () => {
    if (businessTypes.length > 1) return 'Product & Service';
    return businessTypes[0];
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="space-y-8">
      <ListingUsageBar />
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-[#f48c25]">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {listingId ? 'EDIT MODE' : 'ADD NEW MODE'} <span className="text-[#f48c25]">{getTitle()}</span> Listing
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Launch your next storefront in just a few steps. [Debug Active]
          </p>
        </div>
        <div className="flex items-center text-sm font-bold bg-[#f48c25]/10 px-4 py-2 rounded-full text-[#f48c25]">
          <Link href="/dashboard" className="hover:underline transition-all">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
          <Link href="/dashboard/my-listings" className="hover:underline transition-all">My Listings</Link>
          <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
          {!listingId ? (
            <button onClick={onBack} className="hover:underline transition-all">
              Change Type
            </button>
          ) : (
            <span className="text-gray-900">Edit</span>
          )}
          {!listingId && (
            <>
              <ChevronRight className="h-4 w-4 mx-1 opacity-50" />
              <span className="text-gray-900">Add</span>
            </>
          )}
        </div>
      </header>

      {/* Progress Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f48c25] flex items-center justify-center text-white shadow-lg shadow-[#f48c25]/20">
              {React.createElement(steps[currentStep - 1].icon, { size: 20 })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
              <p className="text-xs text-gray-500 font-medium">Step {currentStep} of {steps.length} • {steps[currentStep - 1].section}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-black text-[#f48c25]">{Math.round((currentStep / steps.length) * 100)}%</span>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#f48c25] to-[#ffab5a]"
          />
        </div>

        {/* Steps Navigation Desktop */}
        <div className="hidden lg:flex justify-between relative mb-12 px-2">
          {/* Connecting Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0" />

          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <button
                key={idx}
                onClick={() => handleStepClick(stepNum)}
                className="flex flex-col items-center gap-2 z-10 group"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4
                  ${isActive ? 'bg-[#f48c25] border-white shadow-md scale-110' :
                    isCompleted ? 'bg-green-500 border-white' : 'bg-white border-gray-100'}
                `}>
                  {isCompleted ? (
                    <Check className="text-white" size={18} strokeWidth={3} />
                  ) : (
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {stepNum}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors
                  ${isActive ? 'text-[#f48c25]' : 'text-gray-400 group-hover:text-gray-600'}
                `}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={prevStep}
            className="font-bold text-gray-500 hover:text-gray-900 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isPending}
              className="border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Draft
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="bg-[#f48c25] hover:bg-[#d6761c] text-white font-bold shadow-lg shadow-[#f48c25]/20 group"
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit('published')}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {listingId ? 'Update Listing' : 'Publish Listing'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <InProgressDialog
        isOpen={isUploading && !uploadSuccess && !uploadError}
        message="Uploading your listing..."
      />
      <UploadSuccessDialog
        isOpen={uploadSuccess}
        onClose={() => {
          setUploadSuccess(false);
          // router.push is handled in hook onSuccess
        }}
        message={listingId ? "Your listing has been updated successfully!" : "Your listing has been published successfully!"}
      />
      <ErrorDialog
        isOpen={uploadError}
        message={errorMessage}
        onClose={() => setUploadError(false)}
      />
    </div>
  );
};

export default MultiStepListingForm;
