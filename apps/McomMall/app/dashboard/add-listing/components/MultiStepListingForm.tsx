'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAddListing, useEditListing } from '@/service/listings/hook';
import {
  type BusinessHourPayload,
  type CreateBusinessPayload,
  type DayOfWeek,
  type ListingType,
  type ProductSellerProfilePayload,
  type SellingMode,
  type ServiceProviderProfilePayload,
  type SocialLinkPayload,
  type SpecialDayPayload,
  type StorefrontLinkPayload,
} from '@/service/listings/types';
import { Separator } from '@/components/ui/separator';
import {
  Check,
  Loader2,
  Building2,
  LayoutGrid,
  MapPin,
  Clock,
  Store,
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
import { ListingFormData } from '../types';
import { uploadFile } from '@/lib/upload';
import { InProgressDialog } from '@/components/InProgressDialog';
import { UploadSuccessDialog } from '@/components/UploadSuccessDialog';
import { ErrorDialog } from '@/components/ErrorDialog';

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

const StepIndicator = ({
  currentStep,
  steps,
  onStepClick,
}: {
  currentStep: number;
  steps: {
    title: string;
    component: React.ElementType;
    icon: React.ElementType;
  }[];
  onStepClick: (stepIndex: number) => void;
}) => (
  <div className="flex justify-center items-center mb-8 overflow-x-auto py-2">
    {steps.map((step, index) => (
      <div key={step.title} className="flex items-center flex-shrink-0">
        <div
          className="flex flex-col items-center w-24 cursor-pointer group"
          onClick={() => onStepClick(index + 1)}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-colors duration-300 ${currentStep > index + 1
              ? 'bg-blue-600 text-white'
              : currentStep === index + 1
                ? 'bg-orange-700 text-white'
                : 'bg-muted text-muted-foreground'
              } group-hover:ring-2 group-hover:ring-orange-400 group-hover:ring-offset-2`}
          >
            {currentStep > index + 1 ? (
              <Check />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          <p
            className={`mt-2 text-xs text-center font-medium transition-colors duration-300 ${currentStep >= index + 1
              ? 'text-primary'
              : 'text-muted-foreground'
              } group-hover:text-orange-600`}
          >
            {step.title}
          </p>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`w-16 h-1 mx-4 transition-colors duration-300 ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-muted'
              }`}
          />
        )}
      </div>
    ))}
  </div>
);

const MultiStepListingForm: React.FC<MultiStepListingFormProps> = ({
  businessTypes,
  onBack,
  listingId,
  initialData: propInitialData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
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
      },
    ];
    const productSteps = [
      {
        title: 'Product Categories',
        icon: LayoutGrid,
        component: ProductCategoryStep,
        validationRules: validationRules.productCategory,
      },
      {
        title: 'Location',
        icon: MapPin,
        component: ProductLocationStep,
        validationRules: validationRules.productLocation,
      },
      {
        title: 'Hours',
        icon: Clock,
        component: ProductHoursStep,
        validationRules: {},
      },
      {
        title: 'Selling Modes',
        icon: Store,
        component: SellingModesStep,
        validationRules: validationRules.sellingModes,
      },
    ];
    const serviceSteps = [
      {
        title: 'Service Categories',
        icon: Wrench,
        component: ServiceCategoryStep,
        validationRules: validationRules.serviceCategory,
      },
      {
        title: 'Service Area',
        icon: Map,
        component: ServiceAreaStep,
        validationRules: {},
      },
      {
        title: 'Availability',
        icon: CalendarDays,
        component: ServiceHoursStep,
        validationRules: {},
      },
      // Booking step removed per new service creation requirements
      {
        title: 'Credentials',
        icon: Award,
        component: CredentialsStep,
        validationRules: {},
      },
    ];
    const sharedFinal = [
      {
        title: 'Media',
        icon: Camera,
        component: MediaStep,
        validationRules: validationRules.media,
      },
    ];

    let flowSteps: {
      title: string;
      icon: React.ElementType;
      component: React.ElementType;
      validationRules: object;
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
    // Only allow jumping back or to steps already validated
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else if (stepIndex > currentStep) {
      // If jumping forward, validate current step first
      if (validateStep()) {
        setCurrentStep(stepIndex);
      }
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
        data.productData?.primaryCategory,
        data.productData?.subCategory,
        ...(data.productData?.subCategories || []),
        data.serviceData?.primaryCategory,
        data.serviceData?.tradeCategory,
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
              onError: (err) => {
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
              onError: (err) => {
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

  const CurrentStepComponent = steps[currentStep - 1].component;

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const getTitle = () => {
    if (businessTypes.length > 1) return 'Product & Service';
    return businessTypes[0];
  };

  return (
    <>
      <InProgressDialog isOpen={isUploading} message="Publishing your listing, please wait..." />
      <UploadSuccessDialog
        isOpen={uploadSuccess}
        onClose={() => setUploadSuccess(false)}
        message={listingId ? "Listing updated successfully!" : "Listing published successfully!"}
      />
      <ErrorDialog
        isOpen={uploadError}
        onClose={() => setUploadError(false)}
        message={errorMessage}
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              {listingId ? 'Edit' : 'Add a New'} <span className="text-orange-700">{getTitle()}</span>{' '}
              Listing
            </CardTitle>
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700"
            >
              &larr; Back to selection
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <StepIndicator currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
            >
              <CurrentStepComponent
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                validationRules={steps[currentStep - 1].validationRules}
              />
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between py-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isPending}
            className="w-32"
          >
            Previous
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isPending}
              className="w-32 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Save as Draft
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={nextStep} disabled={isPending} className="w-32 bg-orange-600 hover:bg-orange-700">
                Next
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit('published')}
                disabled={isPending}
                className="w-32 bg-green-600 hover:bg-green-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  listingId ? 'Update' : 'Publish'
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default MultiStepListingForm;
