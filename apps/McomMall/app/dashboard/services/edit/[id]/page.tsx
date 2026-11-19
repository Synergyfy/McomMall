'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  ImagePlus,
  PlusCircle,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SuccessAnimationDialog } from '@/components/SuccessAnimationDialog';
import MultiMediaUpload from '@/components/dashboard/media/MultiMediaUpload';
import { useGetUserListings } from '@/service/listings/hook';
import {
  getBusinessTaxonomy,
  pickCentralBusiness,
} from '@/lib/central-business';
import { useGetServiceById, useUpdateService } from '@/service/services/hook';
import {
  CreateServiceDto,
  CustomerAction,
  PricingType,
  ServiceDeliveryOption,
  ServiceFaq,
} from '@/service/services/types';
import { uploadFile } from '@/lib/upload';
import {
  CUSTOMER_ACTION_LABELS,
  DELIVERY_OPTION_LABELS,
  PRICING_TYPE_OPTIONS,
  resolvePricingType,
} from '@/lib/service-pricing';
import { cn } from '@/lib/utils';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DEFAULT_SCHEDULE = DAYS.map((day) => ({
  day,
  enabled: day !== 'saturday' && day !== 'sunday',
  startTime: '09:00',
  endTime: '17:00',
  breaks: [] as unknown[],
}));

const parseNum = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isImage = (url: string) =>
  !/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url);

const DELIVERY_VALUES: ServiceDeliveryOption[] = [
  'atBusiness',
  'atCustomer',
  'online',
];

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const { data: listings } = useGetUserListings(1, 100);
  const { data: serviceData, isLoading } = useGetServiceById(serviceId);
  const { mutateAsync: updateService, isPending } = useUpdateService();
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState('');
  const [shortDescription, setShortDescription] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  const [existingVideos, setExistingVideos] = React.useState<string[]>([]);
  const [newFiles, setNewFiles] = React.useState<File[]>([]);

  const [pricingType, setPricingType] = React.useState<
    PricingType | undefined
  >();
  const [price, setPrice] = React.useState<number | string>('');
  const [priceMax, setPriceMax] = React.useState<number | string>('');

  const [deliverySelection, setDeliverySelection] = React.useState<
    ServiceDeliveryOption | 'multiple' | ''
  >('');
  const [deliveryOptions, setDeliveryOptions] = React.useState<
    ServiceDeliveryOption[]
  >([]);
  const [customerAction, setCustomerAction] =
    React.useState<CustomerAction>('bookNow');
  const [bookingInstructions, setBookingInstructions] = React.useState('');
  const [appointmentArrangements, setAppointmentArrangements] =
    React.useState('');
  const [availabilityNotes, setAvailabilityNotes] = React.useState('');
  const [schedule, setSchedule] = React.useState<any[]>(DEFAULT_SCHEDULE);

  const [duration, setDuration] = React.useState<number | string>('');
  const [serviceConditions, setServiceConditions] = React.useState('');
  const [faqs, setFaqs] = React.useState<ServiceFaq[]>([]);
  const [publish, setPublish] = React.useState(true);

  const business = pickCentralBusiness(
    (listings?.data ?? []) as Array<any>,
  ) as any;
  const taxonomy = getBusinessTaxonomy(business);

  React.useEffect(() => {
    if (!serviceData) return;

    setName(serviceData.name ?? '');
    setShortDescription(
      serviceData.shortDescription ?? serviceData.shortDesc ?? '',
    );
    setDescription(serviceData.description ?? serviceData.fullDesc ?? '');

    const media = serviceData.media ?? [];
    const images = (serviceData as any).images as string[] | undefined;
    setExistingImages(
      (images && images.length > 0 ? images : media.filter(isImage)) ?? [],
    );
    setExistingVideos(media.filter((url) => !isImage(url)));

    const resolvedPricingType = resolvePricingType(serviceData as any);
    setPricingType(resolvedPricingType);
    setPrice(
      parseNum(
        (serviceData as any).price ??
          serviceData.fixedPrice ??
          serviceData.pricePerHour ??
          serviceData.pricePerUnit ??
          serviceData.basePrice,
      ) ?? '',
    );
    setPriceMax(parseNum((serviceData as any).priceMax) ?? '');

    const options: ServiceDeliveryOption[] =
      serviceData.deliveryOptions && serviceData.deliveryOptions.length > 0
        ? serviceData.deliveryOptions
        : serviceData.deliveryConfig?.mode === 'atShop'
          ? ['atBusiness']
          : serviceData.deliveryConfig?.mode === 'remote'
            ? ['online']
            : ['atCustomer'];
    setDeliveryOptions(options);
    setDeliverySelection(options.length > 1 ? 'multiple' : (options[0] ?? ''));

    setCustomerAction(
      (serviceData.customerAction as CustomerAction) ??
        (serviceData.isQuoteModel ? 'requestQuote' : 'bookNow'),
    );
    setBookingInstructions((serviceData as any).bookingInstructions ?? '');
    setAppointmentArrangements(
      (serviceData as any).appointmentArrangements ?? '',
    );
    setAvailabilityNotes((serviceData as any).availabilityNotes ?? '');

    const serviceSchedule = serviceData.availability?.schedule;
    if (Array.isArray(serviceSchedule) && serviceSchedule.length > 0) {
      setSchedule(
        serviceSchedule.map((day) => ({
          ...day,
          day: String(day.day).toLowerCase(),
          breaks: day.breaks ?? [],
        })),
      );
    } else {
      setSchedule(DEFAULT_SCHEDULE);
    }

    setDuration(
      serviceData.duration || serviceData.availability?.slotDuration || '',
    );
    setServiceConditions((serviceData as any).serviceConditions ?? '');
    setFaqs((serviceData as any).faqs ?? []);
    setPublish((serviceData.status ?? 'published') !== 'draft');
  }, [serviceData]);

  const selectDelivery = (value: ServiceDeliveryOption | 'multiple') => {
    setDeliverySelection(value);
    if (value === 'multiple') {
      if (deliveryOptions.length === 0) setDeliveryOptions([]);
      return;
    }
    setDeliveryOptions([value]);
  };

  const toggleMultipleOption = (option: ServiceDeliveryOption) => {
    setDeliveryOptions((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  const updateSchedule = (index: number, patch: Record<string, unknown>) => {
    setSchedule((current) =>
      current.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    );
  };

  const addFaq = () =>
    setFaqs((current) => [...current, { question: '', answer: '' }]);
  const updateFaq = (index: number, patch: Partial<ServiceFaq>) =>
    setFaqs((current) =>
      current.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)),
    );
  const removeFaq = (index: number) =>
    setFaqs((current) => current.filter((_, i) => i !== index));

  const validate = () => {
    if (!name.trim() || name.trim().length < 3) {
      toast.error('Service name must be at least 3 characters.');
      return false;
    }
    if (!shortDescription.trim()) {
      toast.error('Short description is required.');
      return false;
    }
    if (!description.trim()) {
      toast.error('Full description is required.');
      return false;
    }
    if (!pricingType) {
      toast.error('Select a pricing option.');
      return false;
    }
    const min = parseNum(price);
    const max = parseNum(priceMax);
    if (
      ['fixed', 'startingFrom', 'hourly'].includes(pricingType) &&
      min === undefined
    ) {
      toast.error('Enter a price for the selected pricing option.');
      return false;
    }
    if (pricingType === 'range' && (min === undefined || max === undefined)) {
      toast.error('Enter both a minimum and maximum price.');
      return false;
    }
    if (
      pricingType === 'range' &&
      min !== undefined &&
      max !== undefined &&
      max < min
    ) {
      toast.error('Maximum price cannot be less than the minimum price.');
      return false;
    }
    if (!deliverySelection) {
      toast.error('Select how the service is delivered.');
      return false;
    }
    if (deliverySelection === 'multiple' && deliveryOptions.length < 2) {
      toast.error('Select at least two delivery options.');
      return false;
    }
    if (!customerAction) {
      toast.error('Select the customer action.');
      return false;
    }
    if (existingImages.length === 0 && newFiles.length === 0) {
      toast.error('Keep or upload at least one service image.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!serviceData || !validate()) return;

    setSaving(true);
    try {
      const uploads = await Promise.all(
        newFiles.map((file) => uploadFile(file)),
      );
      const uploadedImages = uploads
        .filter((result, index) => !newFiles[index].type.startsWith('video/'))
        .map((result) => result.secure_url);
      const uploadedVideos = uploads
        .filter((_, index) => newFiles[index].type.startsWith('video/'))
        .map((result) => result.secure_url);

      const min = parseNum(price);
      const max = parseNum(priceMax);
      const isHourly = pricingType === 'hourly';
      const isQuote =
        pricingType === 'quote' || customerAction === 'requestQuote';

      const payload: CreateServiceDto = {
        businessId: serviceData.businessId,
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        shortDesc: shortDescription.trim(),
        fullDesc: description.trim(),
        sector: serviceData.sector || taxonomy.sectorName,
        category: serviceData.category || taxonomy.categoryName,
        subcategory: serviceData.subcategory || taxonomy.subCategoryName,

        pricingType,
        price:
          pricingType === 'quote' || pricingType === 'free' ? undefined : min,
        priceMax: pricingType === 'range' ? max : undefined,

        deliveryOptions,
        customerAction,
        bookingInstructions: bookingInstructions.trim() || undefined,
        appointmentArrangements: appointmentArrangements.trim() || undefined,
        availabilityNotes: availabilityNotes.trim() || undefined,

        duration: parseNum(duration) ?? 0,
        serviceConditions: serviceConditions.trim() || undefined,
        faqs: faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),

        availability: {
          ...(serviceData.availability ?? {}),
          schedule: schedule.map((day) => ({
            ...day,
            day: day.day.charAt(0).toUpperCase() + day.day.slice(1),
            breaks: (day.breaks ?? []).map((brk: any) =>
              typeof brk === 'string' ? brk : `${brk?.start}-${brk?.end}`,
            ),
          })),
          slotDuration: parseNum(duration) || 60,
          bufferTime: 0,
          maxBookingsPerSlot: 1,
          staffPerBooking: 1,
          serviceRadiusKm: serviceData.availability?.serviceRadiusKm ?? 0,
        },

        images: [...existingImages, ...uploadedImages],
        media: [...existingVideos, ...uploadedVideos],

        pricingModel: isHourly ? 'perHour' : 'fixed',
        fixedPrice: isHourly ? undefined : min,
        pricePerHour: isHourly ? min : undefined,
        enableGuestPricing: false,
        isQuoteModel: isQuote,
        requireApproval: customerAction !== 'bookNow',
        isActive: publish ? true : false,
        status: publish ? 'published' : 'draft',
      };

      await updateService({ ...payload, id: serviceId });
      setShowSuccessDialog(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update service.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#f48c25]" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 font-sans sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800">Edit Service</h1>
            <div className="flex items-center text-sm text-gray-500">
              <button type="button" onClick={() => router.push('/dashboard')}>
                Home
              </button>
              <ChevronRight className="mx-1 h-4 w-4" />
              <button
                type="button"
                onClick={() => router.push('/dashboard/services')}
              >
                Services
              </button>
              <ChevronRight className="mx-1 h-4 w-4" />
              <span className="text-gray-700">Edit Service</span>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  The service is attached to your MCOM Central business
                  automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground">Business</p>
                  <p className="font-semibold">
                    {business?.businessName ||
                      serviceData?.business?.businessName ||
                      'Your MCOM Central business'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Input
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-primary" /> Service
                    Images
                  </Label>
                  {existingImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                      {existingImages.map((url) => (
                        <div
                          key={url}
                          className="relative aspect-square overflow-hidden rounded-lg border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="Service"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Remove image"
                            onClick={() =>
                              setExistingImages((current) =>
                                current.filter((item) => item !== url),
                              )
                            }
                            className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <MultiMediaUpload
                    onMediaChange={setNewFiles}
                    maxSize={30 * 1024 * 1024}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add new images or videos. At least one image is required.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Choose how customers are charged and update the matching
                  price.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PRICING_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPricingType(option.value);
                        if (
                          option.value === 'quote' ||
                          option.value === 'free'
                        ) {
                          setPrice('');
                          setPriceMax('');
                        }
                      }}
                      className={cn(
                        'rounded-xl border-2 p-3 text-left text-sm transition-all',
                        pricingType === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 hover:border-gray-200',
                      )}
                    >
                      <span className="block font-bold text-gray-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>

                {(pricingType === 'fixed' ||
                  pricingType === 'startingFrom' ||
                  pricingType === 'hourly') && (
                  <div className="space-y-2">
                    <Label>
                      {pricingType === 'startingFrom'
                        ? 'Starting Price'
                        : pricingType === 'hourly'
                          ? 'Hourly Rate'
                          : 'Price'}{' '}
                      *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                )}

                {pricingType === 'range' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Minimum Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {(pricingType === 'quote' || pricingType === 'free') && (
                  <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                    {pricingType === 'quote'
                      ? 'Customers will request a quotation. No price is required.'
                      : 'Customers will see this service as free.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Booking & availability */}
            <Card>
              <CardHeader>
                <CardTitle>Booking & Availability</CardTitle>
                <CardDescription>
                  Choose how customers receive the service and what they should
                  do next.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Service Delivery *</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      {
                        value: 'atBusiness' as const,
                        label: DELIVERY_OPTION_LABELS.atBusiness,
                      },
                      {
                        value: 'atCustomer' as const,
                        label: DELIVERY_OPTION_LABELS.atCustomer,
                      },
                      {
                        value: 'online' as const,
                        label: DELIVERY_OPTION_LABELS.online,
                      },
                      { value: 'multiple' as const, label: 'Multiple Options' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectDelivery(option.value)}
                        className={cn(
                          'rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all',
                          deliverySelection === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 hover:border-gray-200',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {deliverySelection === 'multiple' && (
                    <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Choose every option that applies
                      </p>
                      {DELIVERY_VALUES.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={deliveryOptions.includes(option)}
                            onChange={() => toggleMultipleOption(option)}
                            className="h-4 w-4 accent-[#f48c25]"
                          />
                          {DELIVERY_OPTION_LABELS[option]}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Customer Action *</Label>
                  <Select
                    value={customerAction}
                    onValueChange={(value) =>
                      setCustomerAction(value as CustomerAction)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUSTOMER_ACTION_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Working Days & Hours</Label>
                  {schedule.map((day, index) => (
                    <div
                      key={day.day}
                      className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center justify-between gap-4 sm:w-40">
                        <span className="text-sm font-bold capitalize">
                          {day.day}
                        </span>
                        <Switch
                          checked={Boolean(day.enabled)}
                          onCheckedChange={(checked) =>
                            updateSchedule(index, { enabled: checked })
                          }
                        />
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          type="time"
                          value={day.startTime ?? '09:00'}
                          disabled={!day.enabled}
                          onChange={(e) =>
                            updateSchedule(index, { startTime: e.target.value })
                          }
                          className="h-9"
                        />
                        <span className="text-gray-400">–</span>
                        <Input
                          type="time"
                          value={day.endTime ?? '17:00'}
                          disabled={!day.enabled}
                          onChange={(e) =>
                            updateSchedule(index, { endTime: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Appointment Arrangements</Label>
                  <Textarea
                    value={appointmentArrangements}
                    onChange={(e) => setAppointmentArrangements(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Instructions</Label>
                  <Textarea
                    value={bookingInstructions}
                    onChange={(e) => setBookingInstructions(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Availability Notes</Label>
                  <Textarea
                    value={availabilityNotes}
                    onChange={(e) => setAvailabilityNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Optional details that help customers decide.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Service Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Conditions</Label>
                  <Textarea
                    value={serviceConditions}
                    onChange={(e) => setServiceConditions(e.target.value)}
                    className="min-h-[90px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Frequently Asked Questions</Label>
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-xl border bg-muted/20 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                          FAQ {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFaq(index)}
                          className="h-8 w-8 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(index, { question: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) =>
                          updateFaq(index, { answer: e.target.value })
                        }
                        className="min-h-[70px]"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFaq}
                    className="w-full border-dashed py-5"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Publish this service
                </p>
                <p className="text-xs text-muted-foreground">
                  Published services are visible to customers on Mcom Mall. Turn
                  this off to keep the service as a draft.
                </p>
              </div>
              <Switch checked={publish} onCheckedChange={setPublish} />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/services')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saving || isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <SuccessAnimationDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          router.push('/dashboard/services');
        }}
      />
    </>
  );
}
