'use client';

import { useState, useMemo, useEffect } from 'react';
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
    'serviceData.tradeCategory': {
      validate: isNotEmpty,
      message: 'Trade category is required.',
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
  }, [businessTypes]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const get = (obj: any, path: string) => {
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
      const value = get(formData, fieldName);


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
    status: 'published' | 'draft' = 'published'
  ): CreateBusinessPayload => {
    const listingType = data.businessTypes.map(
      t => t.toLowerCase() as ListingType
    );

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
          ? 'both'
          : data.serviceData?.serviceLocation?.atBusinessLocation
            ? 'at_location'
            : data.serviceData?.serviceLocation?.customerTravels
              ? 'travel_to_customer'
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
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
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
      listingType,
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
      status: status as any,
      categoryIds: [
        ...(listingType.includes('product')
          ? [
            data.productData?.subCategory,
          ]
          : []),
        ...(listingType.includes('service')
          ? [
            data.serviceData?.tradeCategory,
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
        const value = get(formData, fieldName);

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
    const { isValid, firstErrorStep } = validateAllSteps();
    if (!isValid && status === 'published') {
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

          let finalPayload = fullPayload;

          // Partial update logic if editing
          if (listingId && propInitialData) {
            const initialPayload = transformFormDataToPayload(propInitialData as any);
            const diffPayload = deepDiff(fullPayload, initialPayload);

            // Strategy: always send listingType and businessName for context if available
            diffPayload.listingType = fullPayload.listingType;
            diffPayload.businessName = fullPayload.businessName;
            diffPayload.status = status; // Ensure status reflects draft/published

            finalPayload = diffPayload;
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
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-[#f48c25]">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {listingId ? 'Edit' : 'Add New'} <span className="text-[#f48c25]">{getTitle()}</span> Listing
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Launch your next storefront in just a few steps.
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

      {/* New Colorful Progress Bar */}
      <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-[#f48c25]/10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[#f48c25] text-xs font-black uppercase tracking-[0.2em]">Step {currentStep} of {steps.length}</span>
          <span className="text-gray-900 text-sm font-black">{steps[currentStep - 1]?.title}</span>
        </div>

        <div className="flex justify-between items-center relative z-10 mb-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleStepClick(index + 1)}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 ${currentStep >= index + 1
                  ? 'bg-[#f48c25] text-white scale-110 shadow-lg shadow-[#f48c25]/30'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Background Line */}
        <div className="relative w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#f48c25] transition-all duration-700 ease-in-out"
            style={{ width: steps.length > 1 ? `${((currentStep - 1) / (steps.length - 1)) * 100}%` : '100%' }}
          />
        </div>

        <div className="hidden sm:flex justify-between mt-4">
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${currentStep === index + 1 ? 'text-[#f48c25]' : 'text-gray-400'}`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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

      <div className="flex justify-between pt-8 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isPending}
          className="px-8 h-12 rounded-xl font-bold border-gray-300 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {currentStep === 1 ? 'Change Type' : 'Back'}
        </Button>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSubmit('draft')}
            disabled={isPending}
            className="h-12 px-6 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
          >
            Save as Draft
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isPending}
              className="px-10 h-12 rounded-xl font-black bg-[#f48c25] hover:bg-[#d4791c] text-white shadow-lg shadow-[#f48c25]/20 transition-all border-none"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isPending}
              className="px-14 h-12 rounded-xl font-black bg-[#f48c25] hover:bg-[#d4791c] text-white shadow-lg shadow-[#f48c25]/20 transition-all border-none"
            >
              {isUploading ? 'Uploading...' : isAdding ? 'Publishing...' : <><Save className="w-4 h-4 mr-2" /> Publish Listing</>}
            </Button>
          )}
        </div>
      </div>

      <InProgressDialog isOpen={isPending} message="Saving your changes..." />
      <UploadSuccessDialog
        isOpen={uploadSuccess}
        onClose={() => (window.location.href = '/dashboard/my-listings/active')}
        message="Listing saved successfully!"
      />
      <ErrorDialog
        isOpen={uploadError}
        onClose={() => setUploadError(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default MultiStepListingForm;
