import { z } from 'zod';
import type {
  CustomerAction,
  PricingType,
  ServiceDeliveryOption,
  ServiceFaq,
} from './types';

/**
 * Shape of the Create Service wizard.
 *
 * The form intentionally keeps raw input values (numbers may be strings while
 * typing and media may contain File objects) so users never lose what they
 * typed. All rules live in the `superRefine` below.
 */
export interface ServiceFormValues {
  /* Tab 1 – Basic information */
  name: string;
  shortDescription?: string;
  description?: string;
  media?: (File | string)[];

  /* Injected from the CHS business profile (read-only in the UI) */
  businessId: string;
  sector?: string;
  category?: string;
  subcategory?: string;

  /* Tab 2 – Pricing */
  pricingType?: PricingType | string;
  price?: number | string;
  priceMax?: number | string;

  /* Tab 3 – Booking & availability */
  deliverySelection?: ServiceDeliveryOption | 'multiple' | '';
  deliveryOptions?: ServiceDeliveryOption[];
  customerAction?: CustomerAction | string;
  bookingInstructions?: string;
  appointmentArrangements?: string;
  availabilityNotes?: string;
  availability?: {
    schedule: Array<Record<string, unknown>>;
    slotDuration?: number | string;
    bufferTime?: number | string;
    maxBookingsPerSlot?: number | string;
    staffPerBooking?: number | string;
    serviceRadiusKm?: number | string;
    [key: string]: unknown;
  };

  /* Tab 4 – Additional information (optional) */
  duration?: number | string;
  serviceConditions?: string;
  faqs?: ServiceFaq[];

  /* Legacy compatibility fields */
  isActive?: boolean;
  [key: string]: unknown;
}

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const toNumber = (value: unknown): number | undefined => {
  if (isBlank(value)) return undefined;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const baseSchema = z.record(z.string(), z.any());

export const serviceFormSchema = baseSchema.superRefine((rawValues, ctx) => {
  const values = rawValues as ServiceFormValues;
  const issue = (path: string, message: string) =>
    ctx.addIssue({ code: 'custom', path: [path], message });

  /* ---------------- Tab 1: Basic Information ---------------- */
  if (isBlank(values.businessId)) {
    issue('businessId', 'Your MCOM Central business is required');
  }

  if (isBlank(values.sector)) {
    issue(
      'sector',
      'Add a sector to your business profile in MCOM Central before publishing.',
    );
  }

  if (typeof values.name !== 'string' || values.name.trim().length < 3) {
    issue('name', 'Service name must be at least 3 characters');
  }

  if (
    typeof values.shortDescription !== 'string' ||
    isBlank(values.shortDescription)
  ) {
    issue('shortDescription', 'Short description is required');
  }

  if (typeof values.description !== 'string' || isBlank(values.description)) {
    issue('description', 'Full description is required');
  }

  const media = Array.isArray(values.media) ? values.media : [];
  const hasImage = media.some((item) => {
    if (typeof item === 'string') {
      return !/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(item);
    }
    return item?.type?.startsWith('image/');
  });
  if (!hasImage) {
    issue('media', 'Please upload at least one image');
  }

  /* ---------------- Tab 2: Pricing ---------------- */
  const pricingType = values.pricingType as PricingType | undefined;
  if (!pricingType) {
    issue('pricingType', 'Pricing option is required');
  }

  const price = toNumber(values.price);
  const priceMax = toNumber(values.priceMax);

  if (
    pricingType === 'fixed' ||
    pricingType === 'startingFrom' ||
    pricingType === 'hourly'
  ) {
    if (price === undefined) {
      issue('price', 'Please enter a price for this pricing option');
    } else if (price < 0) {
      issue('price', 'Price cannot be negative');
    }
  }

  if (pricingType === 'range') {
    if (price === undefined) {
      issue('price', 'Minimum price is required');
    } else if (price < 0) {
      issue('price', 'Minimum price cannot be negative');
    }
    if (priceMax === undefined) {
      issue('priceMax', 'Maximum price is required');
    } else if (priceMax < 0) {
      issue('priceMax', 'Maximum price cannot be negative');
    }
    if (price !== undefined && priceMax !== undefined && priceMax < price) {
      issue('priceMax', 'Maximum price cannot be less than the minimum price');
    }
  }

  /* ---------------- Tab 3: Booking & Availability ---------------- */
  if (!values.deliverySelection) {
    issue('deliverySelection', 'Select how the service is delivered');
  }

  if (values.deliverySelection === 'multiple') {
    if (
      !Array.isArray(values.deliveryOptions) ||
      values.deliveryOptions.length < 2
    ) {
      issue(
        'deliveryOptions',
        'Select at least two delivery options, or choose a single option',
      );
    }
  }

  if (!values.customerAction) {
    issue('customerAction', 'Select the action customers should take');
  }

  const schedule = values.availability?.schedule ?? [];
  schedule.forEach((day: any, index) => {
    if (
      day?.enabled &&
      day.startTime &&
      day.endTime &&
      day.endTime <= day.startTime
    ) {
      issue(
        `availability.schedule.${index}.endTime`,
        'End time must be after the start time',
      );
    }
  });

  /* ---------------- Tab 4: Additional Information ---------------- */
  if (!isBlank(values.duration)) {
    const duration = toNumber(values.duration);
    if (duration === undefined || duration < 1) {
      issue('duration', 'Service duration must be at least 1 minute');
    }
  }

  (values.faqs ?? []).forEach((faq, index) => {
    const hasQuestion = !isBlank(faq?.question);
    const hasAnswer = !isBlank(faq?.answer);
    if (hasQuestion !== hasAnswer) {
      issue(
        hasQuestion ? `faqs.${index}.answer` : `faqs.${index}.question`,
        'Add both a question and an answer',
      );
    }
  });
});

export type ServiceFormSchema = z.infer<typeof serviceFormSchema>;

/** Fields owned by each wizard step — used to gate navigation. */
export const serviceStepFields: Record<number, string[]> = {
  1: [
    'businessId',
    'sector',
    'name',
    'shortDescription',
    'description',
    'media',
  ],
  2: ['pricingType', 'price', 'priceMax'],
  3: ['deliverySelection', 'deliveryOptions', 'customerAction'],
  4: ['duration', 'faqs'],
  5: [],
};

/** Human readable step names, used when jumping to the first invalid step. */
export const serviceStepNames: Record<number, string> = {
  1: 'Basic Information',
  2: 'Pricing',
  3: 'Booking & Availability',
  4: 'Additional Information',
  5: 'Preview',
};

/**
 * Maps every field path referenced by the schema to the step that owns it, so
 * a submit-time validation failure can send the user back to the right step.
 */
export const serviceFieldToStep: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const [step, fields] of Object.entries(serviceStepFields)) {
    for (const field of fields) {
      map[field] = Number(step);
    }
  }
  return map;
})();

/** All field paths the schema can report, for mapping backend error messages. */
export const serviceKnownFields: string[] = Array.from(
  new Set([
    ...Object.values(serviceStepFields).flat(),
    'businessId',
    'sector',
    'category',
    'subcategory',
    'availability.slotDuration',
    'faqs',
  ]),
);
