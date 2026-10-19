import { z } from 'zod';

/**
 * Shape of the Add Service wizard form.
 *
 * Kept intentionally permissive (mixed number/string inputs while editing,
 * File objects for media) — the schema below enforces the rules without
 * coercing the stored values, so the user never loses what they typed.
 */
export interface ServiceFormValues {
  name: string;
  plusItem?: any;
  shortDescription?: string;
  description?: string;
  sector: string;
  category?: string;
  subcategory?: string;
  targetAudience?: string;
  tags?: string;
  isActive?: boolean;
  businessId: string;

  pricingModel?: string;
  fixedPrice?: number | string;
  pricePerHour?: number | string;
  pricePerUnit?: number | string;
  unitName?: string;

  enableGuestPricing?: boolean;
  guestPricingModel?: string;
  minGuests?: number | string;
  maxGuests?: number | string;
  pricePerGuest?: number | string;
  fixedGroupPrice?: number | string;
  basePrice?: number | string;
  baseGuests?: number | string;
  additionalGuestPrice?: number | string;

  isQuoteModel?: boolean;
  bookingFee?: number | string;

  bundledServices?: any[];
  configurableAddons?: any[];
  media?: (File | string)[];
  variants?: any[];

  enableTieredPackages?: boolean;
  requireApproval?: boolean;
  tiers?: any[];

  deliveryConfig?: {
    mode?: 'onsite' | 'atShop' | 'remote';
    cities?: string;
    regions?: string;
    travelFee?: number | string;
  };
  pricingRules?: Record<string, unknown>;
  bookingRequirements?: Record<string, unknown>;

  availability?: {
    schedule: Array<Record<string, unknown>>;
    slotDuration?: number | string;
    bufferTime?: number | string;
    maxBookingsPerSlot?: number | string;
    staffPerBooking?: number | string;
    serviceRadiusKm?: number | string;
    [key: string]: unknown;
  };

  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const toNumber = (value: unknown): number | undefined => {
  if (isBlank(value)) return undefined;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const FIXED_PRICE_MODELS = ['fixed', 'perJob', 'perSession', 'subscription'];

/**
 * Permissive base so nested objects/arrays/File values are never stripped or
 * coerced. All real rules live in the `superRefine` below.
 */
const baseSchema = z.record(z.string(), z.any());

export const serviceFormSchema = baseSchema.superRefine((rawValues, ctx) => {
  const values = rawValues as ServiceFormValues;

  const require = (path: string, value: unknown, message: string) => {
    if (isBlank(value)) ctx.addIssue({ code: 'custom', path: [path], message });
  };

  const requireNumber = (
    path: string,
    value: unknown,
    message: string,
    { min, integer }: { min?: number; integer?: boolean } = {},
  ) => {
    const num = toNumber(value);
    if (num === undefined) {
      ctx.addIssue({ code: 'custom', path: [path], message });
      return;
    }
    if (integer && !Number.isInteger(num)) {
      ctx.addIssue({ code: 'custom', path: [path], message: 'Please use a whole number' });
      return;
    }
    if (min !== undefined && num < min) {
      ctx.addIssue({
        code: 'custom',
        path: [path],
        message: message.replace(/ is required\.?$/i, '') + ` must be ${min} or more`,
      });
    }
  };

  /* ---------------- Step 1: Basic Info ---------------- */
  require('businessId', values.businessId, 'Please select a business');

  if (typeof values.name !== 'string' || values.name.trim().length < 3) {
    ctx.addIssue({
      code: 'custom',
      path: ['name'],
      message: 'Service name must be at least 3 characters',
    });
  }

  require('sector', values.sector, 'Sector is required');

  /* ---------------- Step 2: Service Type & Area ---------------- */
  require('deliveryConfig.mode', values.deliveryConfig?.mode, 'Delivery mode is required');

  /* ---------------- Step 3: Pricing ---------------- */
  const model = values.pricingModel;
  require('pricingModel', model, 'Pricing model is required');

  if (model && FIXED_PRICE_MODELS.includes(model)) {
    requireNumber('fixedPrice', values.fixedPrice, 'Base price is required', { min: 0 });
  }
  if (model === 'perHour') {
    requireNumber('pricePerHour', values.pricePerHour, 'Hourly rate is required', { min: 0 });
  }
  if (model === 'perUnit') {
    requireNumber('pricePerUnit', values.pricePerUnit, 'Price per unit is required', { min: 0 });
  }

  if (values.enableGuestPricing) {
    const guestModel = values.guestPricingModel;
    require('guestPricingModel', guestModel, 'Please select a guest pricing model');

    requireNumber('minGuests', values.minGuests, 'Minimum guests is required', {
      min: 1,
      integer: true,
    });
    requireNumber('maxGuests', values.maxGuests, 'Maximum guests is required', {
      min: 1,
      integer: true,
    });

    const min = toNumber(values.minGuests);
    const max = toNumber(values.maxGuests);
    if (min !== undefined && max !== undefined && max < min) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxGuests'],
        message: 'Maximum guests cannot be less than minimum guests',
      });
    }

    if (guestModel === 'perGuest') {
      requireNumber('pricePerGuest', values.pricePerGuest, 'Price per guest is required', { min: 0 });
    } else if (guestModel === 'fixedGroup') {
      requireNumber('fixedGroupPrice', values.fixedGroupPrice, 'Fixed group price is required', { min: 0 });
    } else if (guestModel === 'baseWithAdditional') {
      requireNumber('basePrice', values.basePrice, 'Base price is required', { min: 0 });
      requireNumber('baseGuests', values.baseGuests, 'Base guests is required', {
        min: 0,
        integer: true,
      });
      requireNumber(
        'additionalGuestPrice',
        values.additionalGuestPrice,
        'Price per additional guest is required',
        { min: 0 },
      );
    }
  }

  if (values.isQuoteModel && !isBlank(values.bookingFee)) {
    requireNumber('bookingFee', values.bookingFee, 'Booking fee must be a valid amount', { min: 0 });
  }

  /* ---------------- Step 4: Availability ---------------- */
  requireNumber('availability.slotDuration', values.availability?.slotDuration, 'Service duration is required', {
    min: 1,
    integer: true,
  });
  if (!isBlank(values.availability?.bufferTime)) {
    requireNumber('availability.bufferTime', values.availability?.bufferTime, 'Buffer must be 0 or more', {
      min: 0,
      integer: true,
    });
  }
  if (!isBlank(values.availability?.maxBookingsPerSlot)) {
    requireNumber(
      'availability.maxBookingsPerSlot',
      values.availability?.maxBookingsPerSlot,
      'Max bookings must be 1 or more',
      { min: 1, integer: true },
    );
  }
  if (!isBlank(values.availability?.staffPerBooking)) {
    requireNumber('availability.staffPerBooking', values.availability?.staffPerBooking, 'Staff per booking must be 1 or more', {
      min: 1,
      integer: true,
    });
  }
  if (!isBlank(values.availability?.serviceRadiusKm)) {
    requireNumber('availability.serviceRadiusKm', values.availability?.serviceRadiusKm, 'Radius must be 0 or more', {
      min: 0,
    });
  }

  /* ---------------- Step 6: Media ---------------- */
  if (!Array.isArray(values.media) || values.media.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['media'],
      message: 'Please upload at least one image',
    });
  }
});

export type ServiceFormSchema = z.infer<typeof serviceFormSchema>;

/** Fields owned by each wizard step — used to gate navigation. */
export const serviceStepFields: Record<number, Array<keyof ServiceFormValues>> = {
  1: ['businessId', 'name', 'sector'],
  2: ['deliveryConfig.mode'],
  3: [
    'pricingModel',
    'fixedPrice',
    'pricePerHour',
    'pricePerUnit',
    'guestPricingModel',
    'minGuests',
    'maxGuests',
    'pricePerGuest',
    'fixedGroupPrice',
    'basePrice',
    'baseGuests',
    'additionalGuestPrice',
    'bookingFee',
    'availability.slotDuration',
  ],
  4: [
    'availability.slotDuration',
    'availability.bufferTime',
    'availability.maxBookingsPerSlot',
    'availability.staffPerBooking',
    'availability.serviceRadiusKm',
  ],
  5: ['bookingRequirements', 'requireApproval'],
  6: ['media'],
  7: [],
  8: [],
};

/** Human readable step names, used when jumping to the first invalid step. */
export const serviceStepNames: Record<number, string> = {
  1: 'Basic Info',
  2: 'Type & Area',
  3: 'Pricing',
  4: 'Availability',
  5: 'Workflow',
  6: 'Media',
  7: 'Partnership',
  8: 'Review',
};

/**
 * Maps every field path referenced by the schema to the step that owns it, so
 * a submit-time validation failure can send the user back to the right step.
 */
export const serviceFieldToStep: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const [step, fields] of Object.entries(serviceStepFields)) {
    for (const field of fields) {
      map[String(field)] = Number(step);
    }
  }
  return map;
})();

/** All field paths the schema can report, for mapping backend error messages. */
export const serviceKnownFields: string[] = Array.from(
  new Set([
    'businessId',
    'name',
    'sector',
    'category',
    'subcategory',
    'deliveryConfig.mode',
    'pricingModel',
    'fixedPrice',
    'pricePerHour',
    'pricePerUnit',
    'guestPricingModel',
    'minGuests',
    'maxGuests',
    'pricePerGuest',
    'fixedGroupPrice',
    'basePrice',
    'baseGuests',
    'additionalGuestPrice',
    'bookingFee',
    'availability.slotDuration',
    'availability.bufferTime',
    'availability.maxBookingsPerSlot',
    'availability.staffPerBooking',
    'availability.serviceRadiusKm',
    'media',
  ]),
);
