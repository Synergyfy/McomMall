'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronRight, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAddService } from '@/service/services/hook';
import { CreateServiceDto } from '@/service/services/types';
import { uploadFile } from '@/lib/upload';
import { SuccessAnimationDialog } from '@/components/SuccessAnimationDialog';
import { useGetCategories, useGetSubCategoriesByCategory } from '@/service/taxonomy/hook';

import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2ServiceType } from './components/Step2ServiceType';
import { Step3Pricing } from './components/Step3Pricing';
import { Step4Availability } from './components/Step4Availability';
import { Step5Workflow } from './components/Step5Workflow';
import { Step6FinalReview } from './components/Step6FinalReview';

// --- ZOD SCHEMA ---
const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(160, 'Max 160 characters'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  targetAudience: z.string().optional(), // CSV
  tags: z.string().optional(), // CSV

  businessId: z.string().min(1, 'Please select a business'),
  isActive: z.boolean().default(true),

  // Service Type
  deliveryConfig: z.object({
    mode: z.enum(['onsite', 'atShop', 'remote', 'hybrid']),
    cities: z.string().optional(), // CSV
    regions: z.string().optional(), // CSV
    travelFee: z.coerce.number().min(0).optional(),
  }).optional(),

  // Pricing
  pricingModel: z.enum(['fixed', 'perHour', 'perUnit', 'perJob', 'perDistance', 'perSession', 'subscription']),
  fixedPrice: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  pricePerHour: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  pricePerUnit: z.coerce.number().min(0, 'Price must be >= 0').optional(),
  unitName: z.string().optional(),

  pricingRules: z.object({
    weekendMultiplier: z.coerce.number().min(0).optional(),
    nightSurcharge: z.coerce.number().min(0).optional(),
    emergencySurcharge: z.coerce.number().min(0).optional(),
    holidaySurcharge: z.coerce.number().min(0).optional(),
  }).optional(),

  // Guest Pricing
  enableGuestPricing: z.boolean().default(false),
  minGuests: z.coerce.number().min(1).optional(),
  maxGuests: z.coerce.number().min(1).optional(),
  guestPricingModel: z.enum(['perGuest', 'fixedGroup', 'baseWithAdditional']).optional(),
  pricePerGuest: z.coerce.number().min(0).optional(),
  fixedGroupPrice: z.coerce.number().min(0).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  baseGuests: z.coerce.number().min(1).optional(),
  additionalGuestPrice: z.coerce.number().min(0).optional(),

  // Quote Model
  isQuoteModel: z.boolean().default(false),
  bookingFee: z.coerce.number().min(0).optional(),

  // Availability
  availability: z.object({
    schedule: z.array(z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      breaks: z.array(z.object({
        start: z.string(),
        end: z.string(),
      })).optional()
    })),
    slotDuration: z.number().min(5),
    bufferTime: z.number().min(0),
    maxBookingsPerSlot: z.number().min(1),
    serviceRadiusKm: z.number().optional(),
    staffPerBooking: z.number().min(1).optional(),
  }).optional(),

  // Variants
  variants: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    type: z.enum(['time', 'resource']),
    price: z.coerce.number().min(0),
    duration: z.coerce.number().optional(),
  })).optional(),

  // Arrays
  bundledServices: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    price: z.coerce.number().optional(),
  })).optional(),

  configurableAddons: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    price: z.coerce.number().optional(),
    pricingType: z.enum(['oneTime', 'perGuest', 'perUnit']),
    unitName: z.string().optional(),
  })).optional(),

  // Tiered Packages
  enableTieredPackages: z.boolean().default(false),
  tiers: z.array(z.object({
    name: z.string().min(1, 'Name required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    features: z.array(z.string())
  })).optional(),

  // Booking Logic
  requireApproval: z.boolean().default(false),
  bookingRequirements: z.object({
    requireAddress: z.boolean().default(false),
    requirePhone: z.boolean().default(false),
    requirePhotos: z.boolean().default(false),
    requireProblemDescription: z.boolean().default(false),
    specialInstructions: z.string().optional(),
  }).optional(),

  media: z.array(z.any()).min(1, 'At least one image is required'),
}).superRefine((data, ctx) => {
  // Pricing Model Validation
  if (['fixed', 'perJob', 'perSession', 'subscription'].includes(data.pricingModel) && (data.fixedPrice === undefined || data.fixedPrice === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Base price is required', path: ['fixedPrice'] });
  }
  if (data.pricingModel === 'perHour' && (data.pricePerHour === undefined || data.pricePerHour === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price per hour is required', path: ['pricePerHour'] });
  }
  if (data.pricingModel === 'perUnit') {
    if (data.pricePerUnit === undefined || data.pricePerUnit === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price per unit is required', path: ['pricePerUnit'] });
    }
  }

  // Media Validation
  if (data.media.length > 5) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Max 5 files allowed', path: ['media'] });
  }
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const STEPS = [
  { id: 1, name: 'Basic Info', label: '1' },
  { id: 2, name: 'Type & Area', label: '2' },
  { id: 3, name: 'Pricing', label: '3' },
  { id: 4, name: 'Availability', label: '4' },
  { id: 5, name: 'Workflow', label: '5' },
  { id: 6, name: 'Review', label: '6' },
];

export default function AddServicePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { mutate: addService, isPending: isAddingService } = useAddService();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      category: '',
      subcategory: '',
      targetAudience: '',
      tags: '',
      isActive: true,
      businessId: '',
      pricingModel: 'fixed',
      fixedPrice: 0,
      pricePerHour: 0,
      pricePerUnit: 0,
      enableGuestPricing: false,
      guestPricingModel: 'perGuest',
      isQuoteModel: false,
      bundledServices: [],
      configurableAddons: [],
      media: [],
      variants: [],
      availability: undefined,
      enableTieredPackages: false,
      requireApproval: false,
      deliveryConfig: {
        mode: 'onsite',
        cities: '',
        regions: '',
        travelFee: 0
      },
      pricingRules: {
        weekendMultiplier: 1,
        nightSurcharge: 0,
        emergencySurcharge: 0,
        holidaySurcharge: 0
      },
      bookingRequirements: {
        requireAddress: true,
        requirePhone: true,
        requirePhotos: false,
        requireProblemDescription: true,
        specialInstructions: ''
      },
      tiers: [
        { name: 'Basic', description: '', price: 0, features: [] },
        { name: 'Standard', description: '', price: 0, features: [] },
        { name: 'Premium', description: '', price: 0, features: [] }
      ],
    },
  });

  const { data: categories } = useGetCategories();
  const categoryId = form.watch('category');
  const { data: subcategories } = useGetSubCategoriesByCategory(categoryId);

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const mediaUrls = await Promise.all(
        data.media.map(async (file: File | string) => {
          if (typeof file === 'string') return { secure_url: file, type: 'image' };
          const result = await uploadFile(file);
          return { ...result, type: (file as File).type.startsWith('video/') ? 'video' : 'image' };
        })
      );

      // Transform CSV strings to arrays
      const targetAudience = data.targetAudience?.split(',').map(s => s.trim()).filter(Boolean);
      const tags = data.tags?.split(',').map(s => s.trim()).filter(Boolean);
      const deliveryConfig = data.deliveryConfig ? {
        ...data.deliveryConfig,
        cities: data.deliveryConfig.cities?.split(',').map(s => s.trim()).filter(Boolean),
        regions: data.deliveryConfig.regions?.split(',').map(s => s.trim()).filter(Boolean),
      } : undefined;

      // Taxonomy mapping
      const categoryName = categories?.find(c => c.id === data.category)?.name || data.category;
      const subcategoryName = subcategories?.find(s => s.id === data.subcategory)?.name || data.subcategory;

      // Availability mapping
      const availability = data.availability ? {
        ...data.availability,
        schedule: data.availability.schedule.map(s => ({
          ...s,
          day: s.day.charAt(0).toUpperCase() + s.day.slice(1),
          breaks: s.breaks?.map(b => `${b.start}-${b.end}`)
        }))
      } : undefined;

      const serviceData: CreateServiceDto = {
        ...data,
        shortDesc: data.shortDescription || '',
        fullDesc: data.description || '',
        category: categoryName,
        subcategory: subcategoryName || '',
        targetAudience: targetAudience || [],
        tags: tags || [],
        deliveryConfig: deliveryConfig ? {
          ...deliveryConfig,
          mode: deliveryConfig.mode || 'onsite',
          cities: deliveryConfig.cities || [],
          regions: deliveryConfig.regions || [],
        } : { mode: 'onsite', cities: [], regions: [] },
        availability: availability ? {
          ...availability,
          schedule: availability.schedule?.map(s => ({
            ...s,
            day: s.day as any, // day is already capitalized correctly
            breaks: s.breaks || [],
          })) || [],
          slotDuration: availability.slotDuration || 60,
          bufferTime: availability.bufferTime || 0,
          maxBookingsPerSlot: availability.maxBookingsPerSlot || 1,
        } : undefined,
        images: mediaUrls.filter(m => m.type === 'image').map(result => result.secure_url),
        media: mediaUrls.filter(m => m.type === 'video').map(result => result.secure_url),
      };

      addService(serviceData, {
        onSuccess: () => {
          setShowSuccessDialog(true);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create service');
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during upload');
    }
  };

  const nextStep = async () => {
    let isValid = false;
    const values = form.getValues();

    if (currentStep === 1) {
      isValid = !!values.name && !!values.category;
    } else if (currentStep === 2) {
      isValid = !!values.deliveryConfig?.mode;
    } else if (currentStep === 3) {
      isValid = !!values.pricingModel;
      if (isValid) {
        const isSet = (val: any) => val !== undefined && val !== null && val !== '';
        if (['fixed', 'perJob', 'perSession', 'subscription'].includes(values.pricingModel)) {
          isValid = isSet(values.fixedPrice);
        } else if (values.pricingModel === 'perHour') {
          isValid = isSet(values.pricePerHour);
        } else if (values.pricingModel === 'perUnit') {
          isValid = isSet(values.pricePerUnit);
        }
      }
    } else if (currentStep === 4 || currentStep === 5) {
      isValid = true; // Mostly optional fields
    } else if (currentStep === 6) {
      isValid = !!values.businessId && values.media?.length > 0;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Trigger validation to show error messages in the UI
      const fieldsToValidate: any = {
        1: ['name', 'category'],
        2: ['deliveryConfig.mode'],
        3: ['pricingModel', 'fixedPrice', 'pricePerHour', 'pricePerUnit'],
        6: ['businessId', 'media'],
      };
      const currentFields = fieldsToValidate[currentStep] || [];
      await form.trigger(currentFields);
      toast.error('Please fill in all required fields correctly before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="font-sans">
      <SuccessAnimationDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          router.push('/dashboard/services');
        }}
      />

      <div className="max-w-4xl mx-auto px-4">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Service</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new service offering for your business.
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium">Add Service</span>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8 relative px-2">
          <div className="flex justify-between items-center relative z-10">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step.id
                      ? 'bg-primary text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {step.label}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${currentStep === step.id ? 'text-primary' : 'text-gray-500'
                    }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 h-0.5 bg-gray-200 w-full -z-0">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error('Validation Errors:', errors);
                toast.error('Please check the form for errors before publishing.');
              })}
              className="space-y-8"
            >
              <div className="min-h-[400px]">
                {currentStep === 1 && <Step1BasicInfo />}
                {currentStep === 2 && <Step2ServiceType />}
                {currentStep === 3 && <Step3Pricing />}
                {currentStep === 4 && <Step4Availability />}
                {currentStep === 5 && <Step5Workflow />}
                {currentStep === 6 && <Step6FinalReview />}
              </div>

              <div className="flex justify-between pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep} className="px-8 bg-primary">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isAddingService} className="px-12 bg-primary">
                    {isAddingService ? 'Publishing...' : <><Save className="w-4 h-4 mr-2" /> Publish Service</>}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}
