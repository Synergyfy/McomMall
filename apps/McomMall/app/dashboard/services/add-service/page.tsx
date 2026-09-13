'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { ChevronRight, Save, ArrowLeft, ArrowRight, Store } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAddService } from '@/service/services/hook';
import { CreateServiceDto } from '@/service/services/types';
import { uploadFile } from '@/lib/upload';
import { ProductStatusModal } from '../../store/products/components/wizard/lib/ProductStatusModal';
import { useGetCategories, useGetSubCategoriesByCategory, useGetCategoriesBySector } from '@/service/taxonomy/hook';
import { cn } from '@/lib/utils';

import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2ServiceType } from './components/Step2ServiceType';
import { Step3Pricing } from './components/Step3Pricing';
import { Step4Availability } from './components/Step4Availability';
import { Step5Workflow } from './components/Step5Workflow';
import { Step6FinalReview } from './components/Step6FinalReview';
import { Step7FinalReview } from './components/Step7FinalReview';
import Step7Partnership from '../../store/products/components/wizard/Step7Partnership';
import { useCreateCompositePartnershipRequest } from '@/service/partnerships/hooks';

type ServiceFormValues = any;

const ALL_STEPS = [
  { id: 1, name: 'Basic Info', label: '1' },
  { id: 2, name: 'Type & Area', label: '2' },
  { id: 3, name: 'Pricing', label: '3' },
  { id: 4, name: 'Availability', label: '4' },
  { id: 5, name: 'Workflow', label: '5' },
  { id: 6, name: 'Media', label: '6' },
  { id: 7, name: 'Partnership', label: '7' },
  { id: 8, name: 'Review', label: '8' },
];

const DRAFT_STORAGE_KEY = 'mcommall_service_draft';

function AddServicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOnboarding = searchParams.get('fromOnboarding') === 'true';
  const isHybridFlow = searchParams.get('hybridFlow') === 'true';

  const STEPS = fromOnboarding 
    ? ALL_STEPS.filter(s => s.id !== 2 && s.id !== 4).map((s, index) => ({ ...s, label: (index + 1).toString() }))
    : ALL_STEPS;
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);

  const { mutate: addService, isPending: isAddingService } = useAddService();
  const { mutate: createPartnershipRequest } = useCreateCompositePartnershipRequest();

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const form = useForm<ServiceFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      plusItem: null,
      shortDescription: '',
      description: '',
      sector: '',
      category: '',
      subcategory: '',
      targetAudience: '',
      tags: '',
      isActive: true,
      businessId: '',
      pricingModel: undefined,
      fixedPrice: undefined,
      pricePerHour: undefined,
      pricePerUnit: undefined,
      enableGuestPricing: false,
      guestPricingModel: undefined,
      isQuoteModel: false,
      bundledServices: [],
      configurableAddons: [],
      media: [],
      variants: [],
      availability: {
        schedule: [
          { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'saturday', enabled: false, startTime: '09:00', endTime: '17:00', breaks: [] },
          { day: 'sunday', enabled: false, startTime: '09:00', endTime: '17:00', breaks: [] },
        ],
        slotDuration: 60,
        bufferTime: 15,
        maxBookingsPerSlot: 1,
        staffPerBooking: 1,
        serviceRadiusKm: 10,
      },
      enableTieredPackages: false,
      requireApproval: true,
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

  const sectorId = form.watch('sector');
  const { data: categories } = useGetCategoriesBySector(sectorId);
  const categoryId = form.watch('category');
  const { data: subcategories } = useGetSubCategoriesByCategory(categoryId);

  // Define fields for each step to map errors to steps
  const fieldsByStep: Record<number, string[]> = {
    1: ['businessId', 'name', 'sector', 'category', 'subcategory', 'shortDescription', 'description', 'targetAudience', 'tags'],
    2: ['deliveryConfig.mode', 'deliveryConfig.cities', 'deliveryConfig.regions', 'deliveryConfig.travelFee'],
    3: ['pricingModel', 'fixedPrice', 'pricePerHour', 'pricePerUnit', 'unitName', 'pricingRules', 'enableGuestPricing', 'guestPricingModel', 'minGuests', 'maxGuests', 'configurableAddons', 'bundledServices', 'isQuoteModel', 'bookingFee'],
    4: ['availability.schedule', 'availability.slotDuration', 'availability.bufferTime', 'availability.maxBookingsPerSlot', 'availability.staffPerBooking', 'availability.serviceRadiusKm'],
    5: ['requireApproval', 'bookingRequirements'],
    6: ['media'],
    7: [],
    8: []
  };

  const validateStep = (stepNumber: number) => {
    const values = form.getValues();
    let isValid = true;
    
    // Clear relevant errors before re-validating
    const fieldsToClear = fieldsByStep[stepNumber] || [];
    fieldsToClear.forEach(f => form.clearErrors(f as any));

    const setError = (path: string, message: string) => {
      form.setError(path as any, { type: 'manual', message });
      isValid = false;
    };

    if (stepNumber === 1) {
      if (!values.businessId) setError('businessId', 'Please select a business');
      if (!values.name?.trim()) setError('name', 'Service name is required');
      if (!values.sector) setError('sector', 'Sector is required');
    } else if (stepNumber === 2) {
      if (!values.deliveryConfig?.mode) setError('deliveryConfig.mode', 'Delivery mode is required');
    } else if (stepNumber === 3) {
      if (!values.pricingModel) setError('pricingModel', 'Pricing model is required');
      if (['fixed', 'perJob', 'perSession', 'subscription'].includes(values.pricingModel)) {
        if (values.fixedPrice === undefined || values.fixedPrice === null || values.fixedPrice === '') {
           setError('fixedPrice', 'Base price is required');
        }
      }
      if (values.pricingModel === 'perHour' && (values.pricePerHour === undefined || values.pricePerHour === null || values.pricePerHour === '')) {
         setError('pricePerHour', 'Price per hour is required');
      }
      if (values.pricingModel === 'perUnit' && (values.pricePerUnit === undefined || values.pricePerUnit === null || values.pricePerUnit === '')) {
         setError('pricePerUnit', 'Price per unit is required');
      }
    } else if (stepNumber === 6) {
       // media is optional per backend but good to have
    } else if (stepNumber === 7) {
        // partnership is optional
    }

    return isValid;
  };

  const onSubmit = async (data: ServiceFormValues) => {
    // Manual final check for all steps
    let allValid = true;
    for (let i = 1; i <= 7; i++) {
        if (!validateStep(i)) {
            allValid = false;
            setCurrentStep(i);
            toast.error('Please fix the errors before publishing.');
            return; // Stop and stay on the step with error
        }
    }

    setIsUploading(true);
    try {
      const mediaUrls = await Promise.all(
        data.media.map(async (file: File | string) => {
          if (typeof file === 'string') return { secure_url: file, type: 'image' };
          const result = await uploadFile(file);
          return { ...result, type: (file as File).type.startsWith('video/') ? 'video' : 'image' };
        })
      );

      // Transform CSV strings to arrays
      const targetAudience = data.targetAudience?.split(',').map((s: string) => s.trim()).filter(Boolean);
      const tags = data.tags?.split(',').map((s: string) => s.trim()).filter(Boolean);
      const deliveryConfig = data.deliveryConfig ? {
        ...data.deliveryConfig,
        cities: data.deliveryConfig.cities?.split(',').map((s: string) => s.trim()).filter(Boolean),
        regions: data.deliveryConfig.regions?.split(',').map((s: string) => s.trim()).filter(Boolean),
      } : undefined;

      // Taxonomy mapping
      const categoryName = categories?.find(c => c.id === data.category)?.name || data.category;
      const subcategoryName = subcategories?.find(s => s.id === data.subcategory)?.name || data.subcategory;

      const parseNum = (val: any) => {
        if (val === undefined || val === null || val === '') return undefined;
        const n = parseFloat(val);
        return isNaN(n) ? undefined : n;
      };

      const serviceData: CreateServiceDto = {
        ...data,
        sector: data.sector,
        shortDesc: data.shortDescription || '',
        fullDesc: data.description || '',
        category: categoryName || '',
        subcategory: subcategoryName || '',
        targetAudience: targetAudience || [],
        tags: tags || [],
        
        // Ensure Numeric Data Types
        fixedPrice: parseNum(data.fixedPrice),
        pricePerHour: parseNum(data.pricePerHour),
        pricePerUnit: parseNum(data.pricePerUnit),
        bookingFee: parseNum(data.bookingFee),
        
        minGuests: parseNum(data.minGuests),
        maxGuests: parseNum(data.maxGuests),
        pricePerGuest: parseNum(data.pricePerGuest),
        fixedGroupPrice: parseNum(data.fixedGroupPrice),
        basePrice: parseNum(data.basePrice),
        baseGuests: parseNum(data.baseGuests),
        additionalGuestPrice: parseNum(data.additionalGuestPrice),

        deliveryConfig: data.deliveryConfig ? {
          ...data.deliveryConfig,
          mode: data.deliveryConfig.mode || 'onsite',
          cities: data.deliveryConfig.cities?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
          regions: data.deliveryConfig.regions?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
          travelFee: parseNum(data.deliveryConfig.travelFee) || 0,
        } : { mode: 'onsite', cities: [], regions: [], travelFee: 0 },

        pricingRules: data.pricingRules ? {
            weekendMultiplier: parseNum(data.pricingRules.weekendMultiplier) || 1,
            nightSurcharge: parseNum(data.pricingRules.nightSurcharge) || 0,
            emergencySurcharge: parseNum(data.pricingRules.emergencySurcharge) || 0,
            holidaySurcharge: parseNum(data.pricingRules.holidaySurcharge) || 0,
        } : undefined,

        availability: data.availability ? {
          ...data.availability,
          schedule: data.availability.schedule.map((s: any) => ({
            ...s,
            day: s.day.charAt(0).toUpperCase() + s.day.slice(1),
            breaks: s.breaks?.map((b: any) => `${b.start}-${b.end}`) || []
          })),
          slotDuration: parseNum(data.availability.slotDuration) || 60,
          bufferTime: parseNum(data.availability.bufferTime) || 0,
          maxBookingsPerSlot: parseNum(data.availability.maxBookingsPerSlot) || 1,
          staffPerBooking: parseNum(data.availability.staffPerBooking) || 1,
          serviceRadiusKm: parseNum(data.availability.serviceRadiusKm) || 0,
        } : undefined,

        images: mediaUrls.filter(m => m.type === 'image').map(result => result.secure_url),
        media: mediaUrls.filter(m => m.type === 'video').map(result => result.secure_url),
      };

      setIsUploading(false);
      addService(serviceData, {
        onSuccess: (data: any) => {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          if (data.plusItem || form.getValues('plusItem')) {
              const selectedPlusItem = form.getValues('plusItem');
              const requestDto: any = {};
              if (selectedPlusItem.type === 'product') {
                  requestDto.plusProductId = selectedPlusItem.id;
              } else {
                  requestDto.plusServiceId = selectedPlusItem.id;
              }
              // Set base service ID (the one we just created)
              requestDto.baseServiceId = data.id;

              createPartnershipRequest(requestDto, {
                  onSuccess: () => toast.success('Partnership request sent!'),
                  onError: (err) => toast.error('Service created, but partnership request failed: ' + err.message)
              });
          }
          setCreatedServiceId(data.id);
          setShowSuccessDialog(true);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to create service');
        },
      });
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      toast.error('An error occurred during upload');
    }
  };

  const nextStep = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    if (validateStep(currentStep)) {
      const currentIndex = STEPS.findIndex(s => s.id === currentStep);
      const nextIndex = Math.min(currentIndex + 1, STEPS.length - 1);
      setCurrentStep(STEPS[nextIndex].id);
      setTimeout(() => setIsNavigating(false), 500);
    } else {
      setIsNavigating(false);
      toast.error('Please fix the errors before proceeding.');
      setTimeout(() => {
        const formEl = document.querySelector('form');
        if (!formEl) return;
        const errorElement = formEl.querySelector('[aria-invalid="true"], [data-slot="form-message"]');
        if (errorElement) {
          const item = (errorElement.closest('[data-slot="form-item"]') || errorElement) as HTMLElement;
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const field = formEl.querySelector('[aria-invalid="true"]') as HTMLElement | null;
          if (field) {
            field.classList.add('ring-2', 'ring-destructive');
            setTimeout(() => field.classList.remove('ring-2', 'ring-destructive'), 2500);
          }
        }
      }, 300);
    }
  };

  const prevStep = () => {
    if (isNavigating || isUploading || isAddingService) return;
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(STEPS[prevIndex].id);
  };

  const handleSaveDraft = () => {
    if (isNavigating || isUploading || isAddingService) return;
    const values = form.getValues();
    const draftValues = {
      ...values,
      media: Array.isArray(values.media) ? values.media.filter((m: any) => typeof m === 'string') : [],
      plusItem: values.plusItem ?? null,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ values: draftValues, step: currentStep }));
      toast.success(`Draft saved (step ${currentStep}). You can continue later.`);
    } catch (e) {
      console.error('Failed to save draft', e);
      toast.error('Could not save draft locally.');
    }
  };

  // Restore a previously saved draft on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object' || !draft.values || typeof draft.values !== 'object') return;
      form.reset({ ...form.getValues(), ...draft.values, media: [] });
      if (Number.isInteger(draft.step) && draft.step >= 1 && draft.step <= ALL_STEPS.length) {
        setCurrentStep(draft.step);
      }
      toast.info('Draft restored from last session. Re-upload any media before publishing.');
    } catch (e) {
      console.error('Failed to restore draft', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="font-sans min-h-screen bg-gray-50/50 pb-24 sm:pb-32">
      <ProductStatusModal
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          router.push('/dashboard/services');
        }}
        type="success"
        title="Service Published!"
        message="Your service has been successfully created and is now live."
        primaryAction={{
          label: 'View on LocalMall',
          onClick: () => router.push(`/listings/${createdServiceId}`)
        }}
        secondaryAction={{
          label: 'Add Another Service',
          onClick: () => {
            setShowSuccessDialog(false);
            form.reset();
            setCurrentStep(1);
            setCreatedServiceId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        dashboardAction={{
          label: 'Go to My Services',
          onClick: () => router.push('/dashboard/services')
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8 gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-l-4 border-l-[#f48c25]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Add New Service</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Launch your next offering in just a few steps.
            </p>
          </div>
          <div className="flex flex-wrap items-center text-xs sm:text-sm font-bold bg-[#f48c25]/10 px-3 py-2 rounded-xl sm:rounded-full text-[#f48c25] gap-1">
            <Link href="/dashboard" className="hover:underline transition-all">Home</Link>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 shrink-0" />
            <Link href="/dashboard/services" className="hover:underline transition-all">Services</Link>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 shrink-0" />
            <span className="text-gray-900 whitespace-nowrap">Add Service</span>
          </div>
        </header>

        {/* New Colorful Progress Bar */}
        <div className="mb-6 sm:mb-10 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#f48c25]/10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="text-[#f48c25] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Step {currentStep} of {STEPS.length}</span>
            <span className="text-gray-900 text-xs sm:text-sm font-black">{STEPS.find(s => s.id === currentStep)?.name}</span>
          </div>
          
          <div className="flex justify-between items-center relative z-10 mb-2">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => !isAddingService && !isUploading && !isNavigating && setCurrentStep(step.id)}
              >
                <div
                  className={`w-7 h-7 sm:w-12 sm:h-12 text-[10px] sm:text-base rounded-xl sm:rounded-2xl flex items-center justify-center font-black transition-all duration-300 ${currentStep >= step.id
                      ? 'bg-[#f48c25] text-white scale-110 shadow-lg shadow-[#f48c25]/30'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>
          
          {/* Background Line */}
          <div className="relative w-full h-1.5 sm:h-2 bg-gray-100 rounded-full mt-4 sm:mt-6 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#f48c25] transition-all duration-700 ease-in-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          
          <div className="hidden sm:flex justify-between mt-4">
            {STEPS.map((step) => (
              <span 
                key={step.id}
                className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${currentStep === step.id ? 'text-[#f48c25]' : 'text-gray-400'}`}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>

        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                  e.preventDefault(); // Extra safety
                  form.handleSubmit(onSubmit)(e);
              }}
              className=""
            >
              <div className="">
                {currentStep === 1 && <Step1BasicInfo />}
                {currentStep === 2 && <Step2ServiceType />}
                {currentStep === 3 && <Step3Pricing />}
                {currentStep === 4 && <Step4Availability />}
                {currentStep === 5 && <Step5Workflow />}
                {currentStep === 6 && <Step6FinalReview />}
                {currentStep === 7 && (
                    <Step7Partnership 
                        formData={form.getValues()} 
                        updateFormData={(data) => Object.entries(data).forEach(([key, val]) => form.setValue(key as any, val))} 
                        onNext={nextStep} 
                        onBack={prevStep} 
                    />
                )}
                {currentStep === 8 && <Step7FinalReview />}
              </div>

              {/* Mobile-First Sticky Footer */}
              <footer className={cn("fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none", currentStep === 7 && "hidden")}>
                <div className="max-w-5xl mx-auto flex flex-row gap-2 md:gap-4 justify-between items-center w-full">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1 || isAddingService || isUploading || isNavigating}
                      className="flex-1 md:flex-none px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft size={16} className="hidden sm:block" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isAddingService || isUploading || isNavigating}
                      className="flex-1 md:flex-none md:ml-auto px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-[#f48c25] font-semibold flex justify-center items-center text-[11px] sm:text-base whitespace-nowrap hover:bg-orange-50 transition-colors disabled:opacity-50"
                    >
                      Save Draft
                    </button>

                    {isHybridFlow && (
                      <button
                        type="button"
                        onClick={() => {
                          const skippedProducts = localStorage.getItem('hybridSkippedProducts') === 'true';
                          if (skippedProducts) {
                             toast.error("You must add at least one product or service before proceeding to the dashboard!");
                             return;
                          }
                          localStorage.setItem('hybridSkippedServices', 'true');
                          router.push('/dashboard');
                        }}
                        className="flex-1 md:flex-none px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-gray-500 font-semibold flex justify-center items-center text-[11px] sm:text-base whitespace-nowrap hover:bg-gray-50 transition-colors"
                      >
                        Skip
                      </button>
                    )}

                    {currentStep < STEPS.length ? (
                      <button 
                          type="button" 
                          onClick={nextStep} 
                          disabled={isAddingService || isUploading || isNavigating} 
                          className="flex-1 md:flex-none px-1 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-[#f48c25] text-white font-bold shadow-lg shadow-[#f48c25]/20 flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap disabled:opacity-50 hover:bg-[#d4791c] transition-colors"
                      >
                          Continue <ArrowRight size={16} className="hidden sm:block" />
                      </button>
                    ) : (
                      <button 
                          type="submit" 
                          disabled={isAddingService || isUploading || isNavigating} 
                          className="flex-1 md:flex-none px-1 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-[#f48c25] text-white font-bold shadow-lg shadow-[#f48c25]/20 flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap disabled:opacity-50 hover:bg-[#d4791c] transition-colors"
                      >
                          {isUploading ? 'Uploading...' : isAddingService ? 'Publishing...' : <><Save size={16} className="hidden sm:block" /> Publish</>}
                      </button>
                    )}
                </div>
              </footer>
            </form>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}

export default function AddServicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f48c25]"></div></div>}>
      <AddServicePageContent />
    </Suspense>
  );
}