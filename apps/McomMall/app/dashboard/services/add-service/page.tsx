'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { ChevronRight, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Form } from '@/components/ui/form';
import { useAddService, useUpdateService } from '@/service/services/hook';
import { CreateServiceDto } from '@/service/services/types';
import { uploadFile } from '@/lib/upload';
import {
  zodResolver,
  parseApiError,
  scrollToFirstError,
  toSerializable,
} from '@/lib/form-validation';
import {
  ServiceFormValues,
  serviceFormSchema,
  serviceStepFields,
  serviceStepNames,
  serviceFieldToStep,
  serviceKnownFields,
} from './schema';
import { ProductStatusModal } from '../../store/products/components/wizard/lib/ProductStatusModal';

import { Step1BasicInfo } from './components/Step1BasicInfo';
import { Step2Pricing } from './components/Step2Pricing';
import { Step3BookingAvailability } from './components/Step3BookingAvailability';
import { Step4AdditionalInfo } from './components/Step4AdditionalInfo';
import { Step5Preview } from './components/Step5Preview';

const STEPS = [
  { id: 1, name: 'Basic Information', label: '1' },
  { id: 2, name: 'Pricing', label: '2' },
  { id: 3, name: 'Booking & Availability', label: '3' },
  { id: 4, name: 'Additional Information', label: '4' },
  { id: 5, name: 'Preview', label: '5' },
];

const DRAFT_STORAGE_KEY = 'mcommall_service_draft';
const DRAFT_SERVICE_ID_KEY = 'mcommall_service_draft_id';

const DEFAULT_SCHEDULE = [
  {
    day: 'monday',
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
  {
    day: 'tuesday',
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
  {
    day: 'wednesday',
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
  {
    day: 'thursday',
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
  {
    day: 'friday',
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
  {
    day: 'saturday',
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
  {
    day: 'sunday',
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  },
];

const parseNum = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function AddServicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHybridFlow = searchParams.get('hybridFlow') === 'true';

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const [draftServiceId, setDraftServiceId] = useState<string | null>(null);

  const { mutateAsync: addService, isPending: isAddingService } =
    useAddService();
  const { mutateAsync: updateService, isPending: isUpdatingService } =
    useUpdateService();

  const isBusy =
    isAddingService || isUpdatingService || isUploading || isSavingDraft;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver<ServiceFormValues>(serviceFormSchema, { raw: true }),
    mode: 'onChange',
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      media: [],
      businessId: '',
      sector: '',
      category: '',
      subcategory: '',
      pricingType: undefined,
      price: undefined,
      priceMax: undefined,
      deliverySelection: '',
      deliveryOptions: [],
      customerAction: undefined,
      bookingInstructions: '',
      appointmentArrangements: '',
      availabilityNotes: '',
      availability: {
        schedule: DEFAULT_SCHEDULE,
        slotDuration: 60,
        bufferTime: 0,
        maxBookingsPerSlot: 1,
        staffPerBooking: 1,
        serviceRadiusKm: 0,
      },
      duration: undefined,
      serviceConditions: '',
      faqs: [],
      isActive: true,
    },
  });

  const validateStep = async (stepNumber: number): Promise<boolean> => {
    const fields = serviceStepFields[stepNumber] ?? [];
    if (fields.length === 0) return true;
    return form.trigger(fields as any, { shouldFocus: false });
  };

  const focusFirstError = (delay = 60) => {
    const formEl =
      typeof document !== 'undefined' ? document.querySelector('form') : null;
    scrollToFirstError(formEl, { delay });
  };

  const uploadMedia = async (media: (File | string)[]) => {
    const results = await Promise.all(
      media.map(async (item) => {
        if (typeof item === 'string') {
          return {
            url: item,
            type: /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(item)
              ? 'video'
              : 'image',
          };
        }
        const result = await uploadFile(item);
        return {
          url: result.secure_url,
          type: item.type.startsWith('video/') ? 'video' : 'image',
        };
      }),
    );
    return {
      images: results
        .filter((item) => item.type === 'image')
        .map((item) => item.url),
      videos: results
        .filter((item) => item.type === 'video')
        .map((item) => item.url),
      hasImage: results.some((item) => item.type === 'image'),
    };
  };

  /**
   * Maps the new Create Service form onto the API payload. The API derives the
   * legacy booking fields (pricingModel, fixedPrice, deliveryConfig) so both
   * the old storefront and the new service profile stay consistent.
   */
  const buildPayload = async (
    values: ServiceFormValues,
    { draft }: { draft: boolean },
  ): Promise<CreateServiceDto> => {
    const uploaded = await uploadMedia(
      (values.media ?? []) as (File | string)[],
    );

    const duration = parseNum(values.duration);
    const price = parseNum(values.price);
    const priceMax = parseNum(values.priceMax);
    const pricingType = values.pricingType as string | undefined;
    const customerAction = values.customerAction as string | undefined;

    const schedule = (values.availability?.schedule ?? DEFAULT_SCHEDULE).map(
      (day: any) => ({
        ...day,
        day:
          typeof day.day === 'string'
            ? day.day.charAt(0).toUpperCase() + day.day.slice(1)
            : day.day,
        breaks: (day.breaks ?? []).map((brk: any) =>
          typeof brk === 'string' ? brk : `${brk.start}-${brk.end}`,
        ),
      }),
    );

    const isHourly = pricingType === 'hourly';
    const isQuote =
      pricingType === 'quote' || customerAction === 'requestQuote';

    return {
      businessId: values.businessId,
      name: values.name.trim(),
      shortDescription: values.shortDescription?.trim() || '',
      description: values.description?.trim() || '',
      shortDesc: values.shortDescription?.trim() || '',
      fullDesc: values.description?.trim() || '',
      sector: values.sector,
      category: values.category,
      subcategory: values.subcategory,

      pricingType: values.pricingType as CreateServiceDto['pricingType'],
      price,
      priceMax,

      deliveryOptions: values.deliveryOptions,
      customerAction:
        values.customerAction as CreateServiceDto['customerAction'],
      bookingInstructions: values.bookingInstructions?.trim() || undefined,
      appointmentArrangements:
        values.appointmentArrangements?.trim() || undefined,
      availabilityNotes: values.availabilityNotes?.trim() || undefined,

      duration: duration ?? 0,
      serviceConditions: values.serviceConditions?.trim() || undefined,
      faqs: (values.faqs ?? []).filter(
        (faq) => faq?.question?.trim() && faq?.answer?.trim(),
      ),

      availability: {
        schedule,
        slotDuration: duration && duration > 0 ? duration : 60,
        bufferTime: 0,
        maxBookingsPerSlot: 1,
        staffPerBooking: 1,
        serviceRadiusKm: 0,
      },

      images: uploaded.images,
      media: uploaded.videos,

      // Legacy compatibility fields (the API re-derives these too).
      pricingModel: isHourly ? 'perHour' : 'fixed',
      fixedPrice: isHourly ? undefined : price,
      pricePerHour: isHourly ? price : undefined,
      enableGuestPricing: false,
      isQuoteModel: isQuote,
      requireApproval: customerAction !== 'bookNow',

      isActive: draft ? false : true,
      status: draft ? 'draft' : 'published',
    };
  };

  const persistDraft = async (values: ServiceFormValues) => {
    const { value: draftValues, dropped } = toSerializable<
      Record<string, unknown>
    >({
      ...values,
      media: Array.isArray(values.media)
        ? values.media.filter((item: any) => typeof item === 'string')
        : [],
    });
    if (process.env.NODE_ENV !== 'production' && dropped.length > 0) {
      console.warn(
        '[add-service] Dropped non-serializable draft fields:',
        dropped,
      );
    }
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ values: draftValues, step: currentStep }),
      );
    } catch (error) {
      console.error('Failed to save local draft', error);
    }

    const name = values.name?.trim();
    if (!values.businessId || !name || name.length < 3) {
      toast.success(
        'Draft saved in this browser. Add a service name to save it to your account.',
      );
      return;
    }

    setIsSavingDraft(true);
    try {
      const payload = await buildPayload(values, { draft: true });
      const { value: safePayload } = toSerializable<CreateServiceDto>(payload);

      if (draftServiceId) {
        try {
          await updateService({ ...safePayload, id: draftServiceId });
        } catch (updateError: any) {
          if (updateError?.response?.status === 404) {
            const created = await addService(safePayload);
            setDraftServiceId(created.id);
            localStorage.setItem(DRAFT_SERVICE_ID_KEY, created.id);
          } else {
            throw updateError;
          }
        }
      } else {
        const created = await addService(safePayload);
        setDraftServiceId(created.id);
        localStorage.setItem(DRAFT_SERVICE_ID_KEY, created.id);
      }
      toast.success(
        'Draft saved to your account. You can continue from your Services dashboard.',
      );
    } catch (error) {
      const parsed = parseApiError(error, serviceKnownFields);
      toast.error(
        parsed.general ||
          'Draft saved in this browser, but could not be saved to your account yet.',
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isBusy || isNavigating) return;
    await persistDraft(form.getValues());
  };

  const onSubmit = async (data: ServiceFormValues) => {
    let firstInvalidStep: number | null = null;
    for (const step of STEPS) {
      if (step.id === 5) continue;
      const fields = serviceStepFields[step.id] ?? [];
      const valid =
        fields.length === 0 ? true : await form.trigger(fields as any);
      if (!valid && firstInvalidStep === null) {
        firstInvalidStep = step.id;
      }
    }

    if (firstInvalidStep !== null) {
      setCurrentStep(firstInvalidStep);
      toast.error(
        `Please complete the "${serviceStepNames[firstInvalidStep]}" step before submitting.`,
      );
      focusFirstError(350);
      return;
    }

    setIsUploading(true);
    try {
      const payload = await buildPayload(data, { draft: false });

      if (!payload.images || payload.images.length === 0) {
        form.setError('media', {
          type: 'server',
          message: 'Upload at least one image of your service.',
        });
        setCurrentStep(1);
        toast.error(
          'Upload at least one image of your service before submitting.',
        );
        return;
      }

      const { value: safePayload, dropped } =
        toSerializable<CreateServiceDto>(payload);
      if (process.env.NODE_ENV !== 'production' && dropped.length > 0) {
        console.warn(
          '[add-service] Dropped non-serializable payload fields:',
          dropped,
        );
      }

      setIsUploading(false);

      let result: any;
      if (draftServiceId) {
        try {
          result = await updateService({ ...safePayload, id: draftServiceId });
        } catch (updateError: any) {
          if (updateError?.response?.status === 404) {
            result = await addService(safePayload);
          } else {
            throw updateError;
          }
        }
      } else {
        result = await addService(safePayload);
      }

      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_SERVICE_ID_KEY);
      setDraftServiceId(null);
      setCreatedServiceId(result.id);
      setShowSuccessDialog(true);
    } catch (error) {
      setIsUploading(false);
      const parsed = parseApiError(error, serviceKnownFields);
      if (Object.keys(parsed.fields).length > 0) {
        Object.entries(parsed.fields).forEach(([path, fieldMessage]) => {
          form.setError(path as any, {
            type: 'server',
            message: String(fieldMessage),
          });
        });
        const firstPath = Object.keys(parsed.fields)[0];
        const stepForField = serviceFieldToStep[firstPath];
        if (stepForField) {
          setCurrentStep(stepForField);
          focusFirstError(350);
        }
      }
      toast.error(parsed.general || 'Failed to create service');
    }
  };

  const nextStep = async () => {
    if (isNavigating || isBusy) return;
    setIsNavigating(true);

    const valid = await validateStep(currentStep);

    if (valid) {
      const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
      const nextIndex = Math.min(currentIndex + 1, STEPS.length - 1);
      setCurrentStep(STEPS[nextIndex].id);
      setTimeout(() => setIsNavigating(false), 400);
    } else {
      setIsNavigating(false);
      toast.error(
        `Please fix the highlighted ${serviceStepNames[currentStep] ?? ''} fields before proceeding.`,
      );
      focusFirstError(80);
    }
  };

  const prevStep = () => {
    if (isNavigating || isBusy) return;
    const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(STEPS[prevIndex].id);
  };

  const goToStep = async (targetId: number) => {
    if (isNavigating || isBusy) return;
    if (targetId === currentStep) return;

    const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
    const targetIndex = STEPS.findIndex((step) => step.id === targetId);
    if (targetIndex === -1) return;

    if (targetIndex < currentIndex) {
      setCurrentStep(targetId);
      return;
    }

    setIsNavigating(true);
    for (let i = currentIndex; i < targetIndex; i++) {
      const stepId = STEPS[i].id;
      const valid = await validateStep(stepId);
      if (!valid) {
        setIsNavigating(false);
        setCurrentStep(stepId);
        toast.error(
          `Please fix the highlighted ${serviceStepNames[stepId] ?? ''} fields before moving on.`,
        );
        focusFirstError(80);
        return;
      }
    }

    setIsNavigating(false);
    setCurrentStep(targetId);
  };

  // Restore a previously saved draft on mount.
  React.useEffect(() => {
    try {
      const savedDraftId = localStorage.getItem(DRAFT_SERVICE_ID_KEY);
      if (savedDraftId) setDraftServiceId(savedDraftId);

      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object' || !draft.values) return;
      form.reset({ ...form.getValues(), ...draft.values, media: [] });
      if (
        Number.isInteger(draft.step) &&
        draft.step >= 1 &&
        draft.step <= STEPS.length
      ) {
        setCurrentStep(draft.step);
      }
      toast.info(
        'Draft restored from last session. Re-upload any media before submitting.',
      );
    } catch (error) {
      console.error('Failed to restore draft', error);
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
        title="Service Submitted!"
        message="Your service has been submitted and is now part of your Mcom Mall catalogue."
        primaryAction={{
          label: 'View Service',
          onClick: () => router.push(`/services/${createdServiceId}`),
        }}
        secondaryAction={{
          label: 'Add Another Service',
          onClick: () => {
            setShowSuccessDialog(false);
            form.reset();
            setCurrentStep(1);
            setCreatedServiceId(null);
            setDraftServiceId(null);
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            localStorage.removeItem(DRAFT_SERVICE_ID_KEY);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        }}
        dashboardAction={{
          label: 'Go to My Services',
          onClick: () => router.push('/dashboard/services'),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 sm:mb-8 gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-l-4 border-l-[#f48c25]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Service
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Offer your service on Mcom Mall. Your business details are added
              automatically from MCOM Central.
            </p>
          </div>
          <div className="flex flex-wrap items-center text-xs sm:text-sm font-bold bg-[#f48c25]/10 px-3 py-2 rounded-xl sm:rounded-full text-[#f48c25] gap-1">
            <Link href="/dashboard" className="hover:underline transition-all">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 shrink-0" />
            <Link
              href="/dashboard/services"
              className="hover:underline transition-all"
            >
              Services
            </Link>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 shrink-0" />
            <span className="text-gray-900 whitespace-nowrap">
              Create Service
            </span>
          </div>
        </header>

        {/* Progress */}
        <div className="mb-6 sm:mb-10 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#f48c25]/10">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="text-[#f48c25] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-gray-900 text-xs sm:text-sm font-black">
              {STEPS.find((step) => step.id === currentStep)?.name}
            </span>
          </div>

          <div className="flex justify-between items-center relative z-10 mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => goToStep(step.id)}
              >
                <div
                  className={`w-7 h-7 sm:w-12 sm:h-12 text-[10px] sm:text-base rounded-xl sm:rounded-2xl flex items-center justify-center font-black transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-[#f48c25] text-white scale-110 shadow-lg shadow-[#f48c25]/30'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          <div className="relative w-full h-1.5 sm:h-2 bg-gray-100 rounded-full mt-4 sm:mt-6 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#f48c25] transition-all duration-700 ease-in-out"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="hidden sm:flex justify-between mt-4">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${
                  currentStep === step.id ? 'text-[#f48c25]' : 'text-gray-400'
                }`}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>

        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onSubmit(form.getValues());
              }}
            >
              <div>
                {currentStep === 1 && <Step1BasicInfo />}
                {currentStep === 2 && <Step2Pricing />}
                {currentStep === 3 && <Step3BookingAvailability />}
                {currentStep === 4 && <Step4AdditionalInfo />}
                {currentStep === 5 && (
                  <Step5Preview
                    onEditStep={(step) => {
                      setCurrentStep(step);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </div>

              <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
                <div className="max-w-5xl mx-auto flex flex-row gap-2 md:gap-4 justify-between items-center w-full">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isBusy || isNavigating}
                    className="flex-1 md:flex-none px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} className="hidden sm:block" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isBusy || isNavigating}
                    className="flex-1 md:flex-none md:ml-auto px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-[#f48c25] font-semibold flex justify-center items-center text-[11px] sm:text-base whitespace-nowrap hover:bg-orange-50 transition-colors disabled:opacity-50"
                  >
                    {isSavingDraft ? 'Saving...' : 'Save Draft'}
                  </button>

                  {isHybridFlow && (
                    <button
                      type="button"
                      onClick={() => {
                        const skippedProducts =
                          localStorage.getItem('hybridSkippedProducts') ===
                          'true';
                        if (skippedProducts) {
                          toast.error(
                            'You must add at least one product or service before proceeding to the dashboard!',
                          );
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
                      disabled={isBusy || isNavigating}
                      className="flex-1 md:flex-none px-1 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-[#f48c25] text-white font-bold shadow-lg shadow-[#f48c25]/20 flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap disabled:opacity-50 hover:bg-[#d4791c] transition-colors"
                    >
                      Continue{' '}
                      <ArrowRight size={16} className="hidden sm:block" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isBusy || isNavigating}
                      className="flex-1 md:flex-none px-1 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-[#f48c25] text-white font-bold shadow-lg shadow-[#f48c25]/20 flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap disabled:opacity-50 hover:bg-[#d4791c] transition-colors"
                    >
                      {isUploading ? (
                        'Uploading...'
                      ) : isAddingService || isUpdatingService ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Save size={16} className="hidden sm:block" /> Submit
                          Service
                        </>
                      )}
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f48c25]"></div>
        </div>
      }
    >
      <AddServicePageContent />
    </Suspense>
  );
}
