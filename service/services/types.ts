export interface BundledService {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}

import { Hotspot } from '@/lib/listing-data';
export interface SearchServiceDto {
  term: string;
}

import { IBusiness } from '../merchant/types';

export interface IService extends Service {
  business: IBusiness;
}

export interface TimeRange {
  start: string; // "09:00"
  end: string;   // "13:00"
}

export type DaySchedule = {
  day: string; // Can be lowercase or capitalized
  enabled: boolean;
  startTime: string; // Main start time
  endTime: string;   // Main end time
  breaks?: (TimeRange | string)[]; // Can be TimeRange objects or "HH:mm-HH:mm" strings
}

export interface AvailabilityProfile {
  schedule: DaySchedule[];
  slotDuration: number; // in minutes
  bufferTime: number; // in minutes
  maxBookingsPerSlot: number;
  serviceRadiusKm?: number;
  staffPerBooking?: number; // New: Staff per booking
  publicHolidays?: string[]; // New: List of dates (ISO strings)
}

export interface ServicePricingRules {
  weekendMultiplier?: number;
  nightSurcharge?: number;
  emergencySurcharge?: number;
  holidaySurcharge?: number;
}

export interface BookingRequirements {
  requireAddress: boolean;
  requirePhone: boolean;
  requirePhotos: boolean;
  requireProblemDescription: boolean;
  specialInstructions?: string; // Provider's instructions to customer
  customQuestions?: { question: string; required: boolean }[];
}

export interface ServiceDeliveryConfig {
  mode: 'onsite' | 'atShop' | 'remote' | 'hybrid';
  // If onsite:
  cities?: string[];
  regions?: string[];
  travelFee?: number;
  // Radius is in AvailabilityProfile, but could be here too.
}

export interface ServiceVariant {
  name: string; // e.g. "1 Hour", "2 Technicians"
  type: 'time' | 'resource';
  price: number;
  duration?: number; // for time variants
}

export interface CreateServiceDto {
  name: string;
  shortDescription?: string; // New
  description?: string;
  shortDesc?: string; // New
  fullDesc?: string; // New
  category?: string; // New
  subcategory?: string; // New
  targetAudience?: string[]; // New
  tags?: string[]; // New

  images?: string[];
  media?: string[] | null; // New
  isActive?: boolean;
  businessId: string;

  // Pricing
  pricingModel: 'fixed' | 'perHour' | 'perUnit' | 'perJob' | 'perDistance' | 'perSession' | 'subscription'; // Expanded
  fixedPrice?: number;
  pricePerHour?: number;
  pricePerUnit?: number;
  unitName?: string;

  // Guest Pricing
  enableGuestPricing?: boolean;
  guestPricingModel?: 'perGuest' | 'fixedGroup' | 'baseWithAdditional';
  minGuests?: number;
  maxGuests?: number;
  pricePerGuest?: number;
  fixedGroupPrice?: number;
  basePrice?: number;
  baseGuests?: number;
  additionalGuestPrice?: number;

  // Quote
  isQuoteModel?: boolean;
  bookingFee?: number;
  requireApproval?: boolean;

  // Bundles & Addons
  bundledServices?: { name: string; price?: number }[];
  configurableAddons?: {
    name: string;
    price?: number;
    pricingType: 'oneTime' | 'perGuest' | 'perUnit';
    unitName?: string;
  }[];

  // Tiers (Packages)
  enableTieredPackages?: boolean;
  tiers?: { name: string; description?: string; price: number; features: string[] }[]; // Existing, covers "Package Builder"

  // New Sections
  deliveryConfig?: ServiceDeliveryConfig;
  pricingRules?: ServicePricingRules;
  bookingRequirements?: BookingRequirements;
  variants?: ServiceVariant[]; // For Time/Resource variants

  hotspots?: Hotspot[];
  availability?: AvailabilityProfile;
}

export interface UpdateServiceDto extends CreateServiceDto {
  id: string;
}

export interface ConfigurableAddon {
  id: string;
  serviceId: string;
  name: string;
  price: string;
  pricingType: 'oneTime' | 'perGuest' | 'perUnit';
  unitName: string;
  deletedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  shortDescription?: string;
  description?: string;
  shortDesc?: string;
  fullDesc?: string;
  category?: string;
  subcategory?: string;
  targetAudience?: string[];
  tags?: string[];

  images?: string[];
  media: string[] | null;
  isActive: boolean;

  pricingModel: 'fixed' | 'perHour' | 'perUnit' | 'perJob' | 'perDistance' | 'perSession' | 'subscription';
  fixedPrice: string | null;
  pricePerHour: string | null;
  pricePerUnit: string | null;
  unitName: string | null;

  enableGuestPricing: boolean;
  guestPricingModel: string | null;
  minGuests: number;
  maxGuests: number;
  pricePerGuest: string | null;
  fixedGroupPrice: string | null;
  basePrice: string | null;
  baseGuests: string | null;
  additionalGuestPrice: string | null;

  isQuoteModel: boolean;
  requireApproval?: boolean;
  bookingFee: string | null;

  bundledServices: BundledService[];
  configurableAddons: ConfigurableAddon[];

  // New fields in Service object (reflected from DTO)
  deliveryConfig?: ServiceDeliveryConfig;
  pricingRules?: ServicePricingRules;
  bookingRequirements?: BookingRequirements;
  variants?: ServiceVariant[];

  hotspots?: Hotspot[];
  deletedAt: string | null;
  created_at: string;
  updated_at: string;

  status?: string;
  duration?: number;
  isFeatured?: boolean;
  business?: IBusiness;
  availability?: AvailabilityProfile;
}
