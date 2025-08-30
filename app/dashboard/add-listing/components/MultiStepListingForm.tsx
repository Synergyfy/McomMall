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
  type BookingMethod,
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
  CalendarCheck,
  Award,
  Camera,
  Star,
} from 'lucide-react';
import {
  isNotEmpty,
  isLength,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from '@/lib/validation';
import { ListingFormData } from '../types';

// Import all step components
import BusinessInfoStep from './steps/shared/BusinessInfoStep';
import MediaStep from './steps/shared/MediaStep';
import ReviewStep from './steps/shared/ReviewStep';
import ProductCategoryStep from './steps/product/ProductCategoryStep';
import ProductLocationStep from './steps/product/ProductLocationStep';
import ProductHoursStep from './steps/product/ProductHoursStep';
import SellingModesStep from './steps/product/SellingModesStep';
import ServiceCategoryStep from './steps/service/ServiceCategoryStep';
import ServiceAreaStep from './steps/service/ServiceAreaStep';
import ServiceHoursStep from './steps/service/ServiceHoursStep';
import BookingStep from './steps/service/BookingStep';
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
    'logo.altText': {
      validate: () => true, // Always valid
      message: '',
      optional: true,
    },
    'banner.altText': {
      validate: () => true, // Always valid
      message: '',
      optional: true,
    },
  },
  productCategory: {
    'productData.primaryCategory': {
      validate: isNotEmpty,
      message: 'Primary category is required.',
    },
  },
  productLocation: {
    address: {
      validate: isNotEmpty,
      message: 'Address is required.',
    },
  },
  sellingModes: {
    'productData.sellingModes': {
      validate: (modes: { [s: string]: boolean }) =>
        Object.values(modes).some(v => v),
      message: 'At least one selling mode must be selected.',
    },
    'productData.storefrontLinks.amazon': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
    'productData.storefrontLinks.ebay': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
    'productData.storefrontLinks.etsy': {
      validate: isValidUrl,
      message: 'Invalid URL.',
      optional: true,
    },
  },
  serviceCategory: {
    'serviceData.tradeCategory': {
      validate: isNotEmpty,
      message: 'Trade category is required.',
    },
  },
  booking: {
    'serviceData.bookingURL': {
      validate: isValidUrl,
      message: 'A valid booking URL is required for online booking.',
      // This validation is conditional, handled in validateStep
    },
  },
};

const StepIndicator = ({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: {
    title: string;
    component: React.ElementType;
    icon: React.ElementType;
  }[];
}) => (
  <div className="flex justify-center items-center mb-8 overflow-x-auto py-2">
    {steps.map((step, index) => (
      <div key={step.title} className="flex items-center flex-shrink-0">
        <div className="flex flex-col items-center w-24">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-colors duration-300 ${
              currentStep > index + 1
                ? 'bg-blue-600 text-white'
                : currentStep === index + 1
                ? 'bg-orange-700 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {currentStep > index + 1 ? (
              <Check />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          <p
            className={`mt-2 text-xs text-center font-medium transition-colors duration-300 ${
              currentStep >= index + 1
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {step.title}
          </p>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`w-16 h-1 mx-4 transition-colors duration-300 ${
              currentStep > index + 1 ? 'bg-blue-600' : 'bg-muted'
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
      businessTypes: businessTypes as ('Product' | 'Service')[],
      businessName: '',
      phone: '',
      email: '',
      shortDesc: '',
      socials: { website: '' },
      logo: null,
      banner: null,
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
        storefrontLinks: {},
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
        bookingMethod: 'call',
        pricingVisibility: 'quote',
      };
    }
    return initialData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: addListing, isPending: isAdding } = useAddListing();
  const { mutate: editListing, isPending: isEditing } = useEditListing();
  const isPending = isAdding || isEditing;

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
      {
        title: 'Booking',
        icon: CalendarCheck,
        component: BookingStep,
        validationRules: validationRules.booking,
      },
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
      {
        title: 'Review & Publish',
        icon: Star,
        component: ReviewStep,
        validationRules: {},
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

      // Conditional validation for logo/banner alt text
      if (fieldName === 'logo.altText' && !formData.logo?.file) {
        continue;
      }
      if (fieldName === 'banner.altText' && !formData.banner?.file) {
        continue;
      }

      // Conditional validation for booking URL
      if (
        fieldName === 'serviceData.bookingURL' &&
        formData.serviceData?.bookingMethod !== 'online'
      ) {
        continue;
      }

      if (rule.optional && (value === undefined || value === null || value === '')) {
        continue;
      }

      if (!rule.validate(value)) {
        newErrors[fieldName] = rule.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const transformFormDataToPayload = (
    data: ListingFormData
  ): CreateBusinessPayload => {
    const listingType = data.businessTypes.map(
      t => t.toLowerCase() as ListingType
    );

    const formatUrl = (url?: string): string | undefined => {
      if (!url) return undefined;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `https://${url}`;
    };

    // --- Location and Service Area ---
    const location: CreateBusinessPayload['location'] = {
      addressLine1: data.address || '',
      postcode: '', // Note: No postcode in ListingFormData, needs to be extracted from address
      city: '', // Note: No city in ListingFormData, needs to be extracted from address
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
    };

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

      const storefrontLinks: StorefrontLinkPayload[] = Object.entries(
        data.productData.storefrontLinks || {}
      )
        .map(([platform, url]) => {
          const formattedUrl = formatUrl(url);
          return formattedUrl
            ? {
                platform: platform as StorefrontLinkPayload['platform'],
                url: formattedUrl,
              }
            : null;
        })
        .filter((link): link is StorefrontLinkPayload => link !== null);

      productSellerProfile = {
        sellingModes,
        fulfilmentNotes: data.productData.fulfilmentNotes,
        returnsPolicy: data.productData.returnsPolicy,
        hasAgeRestrictedItems: false, // This is not in the form data
        storefrontLinks,
      };
    }

    // --- Service Provider Profile ---
    let serviceProviderProfile: ServiceProviderProfilePayload | undefined;
    if (data.serviceData) {
      const bookingMethodMap: {
        [key: string]: BookingMethod;
      } = {
        call: 'call_to_book',
        quote: 'request_a_quote',
        online: 'book_online',
      };
      const apiBookingMethod =
        bookingMethodMap[data.serviceData.bookingMethod || ''] ||
        'call_to_book';

      serviceProviderProfile = {
        bookingMethod: apiBookingMethod,
        bookingUrl: data.serviceData.bookingURL,
        quoteOnly: data.serviceData.pricingVisibility === 'quote',
        hasPublicLiabilityInsurance: false, // This is not in the form data
        certifications: [], // File upload needed
      };
    }

    const payload: CreateBusinessPayload = {
      listingType,
      businessName: data.businessName,
      legalName: data.legalName,
      companyRegistrationNumber: data.companyRegNo,
      vatNumber: data.vatNo,
      shortDescription: data.shortDesc,
      about: data.longDesc,
      website: data.socials.website,
      businessPhone: data.phone,
      businessEmail: data.email,
      logoUrl: undefined, // Requires file upload handling
      bannerUrl: undefined, // Requires file upload handling
      logoAltText: data.logo?.altText,
      bannerAltText: data.banner?.altText,
      location,
      socialLinks,
      categoryIds: [
        data.productData?.primaryCategory,
        data.productData?.subCategory,
        ...(data.productData?.subCategories || []),
        data.serviceData?.primaryCategory,
        data.serviceData?.tradeCategory,
      ]
        .filter((id): id is string => !!id)
        .filter((id, index, self) => self.indexOf(id) === index),
      businessHours,
      specialDays,
      productSellerProfile,
      serviceProviderProfile,
    };

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

        if (fieldName === 'logo.altText' && !formData.logo?.file) continue;
        if (fieldName === 'banner.altText' && !formData.banner?.file) continue;

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

  const handleSubmit = () => {
    const { isValid, firstErrorStep } = validateAllSteps();
    if (isValid) {
      const payload = transformFormDataToPayload(formData);
      if (listingId) {
        editListing({ listingId, payload });
      } else {
        addListing(payload);
      }
    } else if (firstErrorStep !== null) {
      setCurrentStep(firstErrorStep);
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Add a New <span className="text-orange-700">{getTitle()}</span>{' '}
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
          <StepIndicator currentStep={currentStep} steps={steps} />
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
        <CardFooter className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            className={`${
              currentStep === 1 ? 'invisible' : 'visible'
            } text-blue-600 border-blue-600 hover:bg-blue-50`}
          >
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              className="bg-orange-700 hover:bg-orange-800"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-orange-700 hover:bg-orange-800"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default MultiStepListingForm;
