import type {
  CustomerAction,
  PricingType,
  ServiceDeliveryOption,
} from '@/app/admin/services/add/types';

type PriceSource = {
  pricingType?: PricingType | string | null;
  pricingModel?: string | null;
  price?: string | number | null;
  priceMax?: string | number | null;
  fixedPrice?: string | number | null;
  pricePerHour?: string | number | null;
  pricePerUnit?: string | number | null;
  basePrice?: string | number | null;
  unitName?: string | null;
  isQuoteModel?: boolean | null;
};

export const PRICING_TYPE_OPTIONS: Array<{
  value: PricingType;
  label: string;
  description: string;
}> = [
  {
    value: 'fixed',
    label: 'Fixed Price',
    description: 'One set price for the service.',
  },
  {
    value: 'startingFrom',
    label: 'Starting From',
    description: 'The service starts at a specified price.',
  },
  {
    value: 'range',
    label: 'Price Range',
    description: 'Give customers a minimum and maximum price.',
  },
  {
    value: 'hourly',
    label: 'Hourly Rate',
    description: 'Charge customers per hour.',
  },
  {
    value: 'quote',
    label: 'Quote Required',
    description: 'Customers request a quotation before booking.',
  },
  {
    value: 'free',
    label: 'Free',
    description: 'No charge for this service.',
  },
];

export const DELIVERY_OPTION_LABELS: Record<ServiceDeliveryOption, string> = {
  atBusiness: 'At business premises',
  atCustomer: 'At customer location',
  online: 'Online / Remote',
};

export const CUSTOMER_ACTION_LABELS: Record<CustomerAction, string> = {
  bookNow: 'Book Now',
  requestQuote: 'Request a Quote',
  enquiry: 'Make an Enquiry',
  contactBusiness: 'Contact Business',
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const formatMoney = (value: unknown): string | null => {
  const amount = toNumber(value);
  if (amount === undefined) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Resolves the pricing type for legacy rows that only have pricingModel.
 */
export function resolvePricingType(service: PriceSource): PricingType {
  if (service.pricingType) return service.pricingType as PricingType;
  if (service.isQuoteModel) return 'quote';
  if (service.pricingModel === 'perHour') return 'hourly';
  return 'fixed';
}

export function getServicePriceLabel(service: PriceSource): string {
  const pricingType = resolvePricingType(service);
  const price =
    toNumber(service.price) ??
    toNumber(service.fixedPrice) ??
    toNumber(service.pricePerHour) ??
    toNumber(service.pricePerUnit) ??
    toNumber(service.basePrice);
  const priceMax = toNumber(service.priceMax);

  switch (pricingType) {
    case 'startingFrom': {
      const formatted = formatMoney(price);
      return formatted ? `From ${formatted}` : 'From price on request';
    }
    case 'range': {
      const min = formatMoney(price);
      const max = formatMoney(priceMax);
      if (min && max) return `${min} – ${max}`;
      return min || max || 'Price on request';
    }
    case 'hourly': {
      const formatted = formatMoney(price);
      return formatted ? `${formatted}/hour` : 'Hourly rate on request';
    }
    case 'quote':
      return 'Quote required';
    case 'free':
      return 'Free';
    case 'fixed':
    default: {
      const formatted = formatMoney(price);
      if (formatted) return formatted;
      return service.isQuoteModel ? 'Quote required' : 'Price on request';
    }
  }
}

export function getPricingTypeLabel(service: PriceSource): string {
  const pricingType = resolvePricingType(service);
  return (
    PRICING_TYPE_OPTIONS.find((option) => option.value === pricingType)
      ?.label ?? 'Price on request'
  );
}
