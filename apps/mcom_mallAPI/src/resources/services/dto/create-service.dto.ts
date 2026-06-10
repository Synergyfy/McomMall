import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateIf,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AddonPricingType,
  DeliveryMode,
  GuestPricingModel,
  PricingModel,
  VariantType,
} from '../service.enum';

export class BundledServiceDto {
  @ApiProperty({
    description: 'Name of the bundled service',
    example: 'Standard Setup',
  })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty({ description: 'Price of the bundled service', example: 50.0 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class ConfigurableAddonDto {
  @ApiProperty({ description: 'Name of the addon', example: 'Extra Cleaning' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty({ description: 'Price of the addon', example: 15.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    enum: AddonPricingType,
    description: 'Pricing type for the addon',
    example: AddonPricingType.ONE_TIME,
  })
  @IsEnum(AddonPricingType)
  pricingType: AddonPricingType;

  @ApiPropertyOptional({
    description: 'Name of the unit (e.g., room, hour)',
    example: 'room',
  })
  @ValidateIf((o) => o.pricingType === AddonPricingType.PER_UNIT)
  @IsString()
  @MaxLength(50)
  unitName?: string;
}

export class DeliveryConfigDto {
  @ApiProperty({
    enum: DeliveryMode,
    description: 'Delivery mode for the service',
    example: DeliveryMode.ONSITE,
  })
  @IsEnum(DeliveryMode)
  mode: DeliveryMode;

  @ApiPropertyOptional({
    description: 'List of cities where the service is available',
    example: ['New York', 'Los Angeles'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({
    description: 'List of regions where the service is available',
    example: ['California', 'New York State'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  regions?: string[];

  @ApiPropertyOptional({ description: 'Additional travel fee', example: 10.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  travelFee?: number;
}

export class PricingRulesDto {
  @ApiPropertyOptional({
    description: 'Multiplier for weekend rates',
    example: 1.2,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weekendMultiplier?: number;

  @ApiPropertyOptional({
    description: 'Surcharge for night-time services',
    example: 5.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  nightSurcharge?: number;

  @ApiPropertyOptional({
    description: 'Surcharge for emergency/urgent requests',
    example: 20.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  emergencySurcharge?: number;

  @ApiPropertyOptional({
    description: 'Surcharge for holiday services',
    example: 15.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  holidaySurcharge?: number;
}

export class AvailabilityScheduleDto {
  @ApiProperty({ description: 'Day of the week', example: 'Monday' })
  @IsString()
  day: string;

  @ApiProperty({
    description: 'Whether the service is available on this day',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Start time of availability (24h format)',
    example: '09:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time of availability (24h format)',
    example: '17:00',
  })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Breaks during the day' })
  @IsArray()
  @IsOptional()
  breaks?: any[];
}

export class AvailabilityDto {
  @ApiProperty({
    type: [AvailabilityScheduleDto],
    description: 'Weekly availability schedule',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityScheduleDto)
  schedule: AvailabilityScheduleDto[];

  @ApiProperty({
    description: 'Duration of each booking slot (minutes)',
    example: 60,
  })
  @IsNumber()
  @Min(1)
  slotDuration: number;

  @ApiProperty({
    description: 'Buffer time between slots (minutes)',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  bufferTime: number;

  @ApiProperty({
    description: 'Maximum number of bookings allowed per slot',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  maxBookingsPerSlot: number;

  @ApiPropertyOptional({
    description: 'Service radius in Kilometers',
    example: 20,
  })
  @IsNumber()
  @IsOptional()
  serviceRadiusKm?: number;

  @ApiPropertyOptional({
    description: 'Number of staff members required per booking',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  staffPerBooking?: number;
}

export class ServiceVariantDto {
  @ApiProperty({
    description: 'Name of the variant',
    example: 'Morning Session',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: VariantType,
    description: 'Type of variant',
    example: VariantType.TIME,
  })
  @IsEnum(VariantType)
  type: VariantType;

  @ApiProperty({ description: 'Price for this variant', example: 45.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Duration in minutes (for time variants)',
    example: 120,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;
}

export class ServiceTierDto {
  @ApiProperty({ description: 'Name of the tier', example: 'Gold Package' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the tier',
    example: 'Includes premium features and support',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price for the tier', example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'List of features included in this tier',
    example: ['24/7 Support', 'Free Delivery'],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];
}

export class BookingRequirementsDto {
  @ApiProperty({
    description: 'Whether the customer address is required',
    example: true,
  })
  @IsBoolean()
  requireAddress: boolean;

  @ApiProperty({
    description: 'Whether the customer phone is required',
    example: true,
  })
  @IsBoolean()
  requirePhone: boolean;

  @ApiProperty({
    description: 'Whether photos are required for booking',
    example: false,
  })
  @IsBoolean()
  requirePhotos: boolean;

  @ApiProperty({
    description: 'Whether a description of the problem is required',
    example: true,
  })
  @IsBoolean()
  requireProblemDescription: boolean;

  @ApiPropertyOptional({
    description: 'Any special instructions for the user',
    example: 'Please provide clear photos of the area',
  })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class CreateServiceDto {
  @ApiProperty({
    description: 'Name of the service',
    example: 'Professional House Cleaning',
  })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiPropertyOptional({
    description: 'Short catchy description',
    example: 'Make your home sparkle',
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the service',
    example:
      'We offer full house cleaning services including kitchens, bathrooms, and bedrooms.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Service sector', example: 'Home Improvement' })
  @IsString()
  @IsNotEmpty()
  sector: string;

  @ApiPropertyOptional({
    description: 'Service category',
    example: 'Home Services',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Service subcategory',
    example: 'Cleaning',
  })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Target audience for the service',
    example: ['Homeowners', 'Renters'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @ApiPropertyOptional({
    description: 'Search tags',
    example: ['cleaning', 'maid', 'home'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'List of media URLs',
    example: ['https://example.com/video1.mp4'],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  media?: string[];

  @ApiPropertyOptional({
    description: 'List of image URLs',
    example: ['https://example.com/img1.jpg'],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'Short description (alias)',
    example: 'House sparkle',
  })
  @IsString()
  @IsOptional()
  shortDesc?: string;

  @ApiPropertyOptional({
    description: 'Full description (alias)',
    example: 'Complete professional cleaning',
  })
  @IsString()
  @IsOptional()
  fullDesc?: string;

  @ApiPropertyOptional({
    description: 'Whether the service is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    enum: PricingModel,
    description: 'Pricing model for the service',
    example: PricingModel.FIXED,
  })
  @IsEnum(PricingModel)
  pricingModel: PricingModel;

  @ApiPropertyOptional({
    description: 'Fixed price for the service',
    example: 100.0,
  })
  @ValidateIf((o) => o.pricingModel === PricingModel.FIXED)
  @IsNumber()
  @Min(0)
  fixedPrice?: number;

  @ApiPropertyOptional({ description: 'Price per hour', example: 25.0 })
  @ValidateIf((o) => o.pricingModel === PricingModel.PER_HOUR)
  @IsNumber()
  @Min(0)
  pricePerHour?: number;

  @ApiPropertyOptional({ description: 'Price per unit', example: 10.0 })
  @ValidateIf((o) => o.pricingModel === PricingModel.PER_UNIT)
  @IsNumber()
  @Min(0)
  pricePerUnit?: number;

  @ApiPropertyOptional({ description: 'Name of the unit', example: 'room' })
  @ValidateIf((o) => o.pricingModel === PricingModel.PER_UNIT)
  @IsString()
  @MaxLength(50)
  unitName?: string;

  @ApiProperty({ description: 'Enable guest-based pricing', example: false })
  @IsBoolean()
  enableGuestPricing: boolean;

  @ApiPropertyOptional({
    enum: GuestPricingModel,
    description: 'Guest pricing model',
    example: GuestPricingModel.PER_GUEST,
  })
  @ValidateIf((o) => o.enableGuestPricing)
  @IsEnum(GuestPricingModel)
  guestPricingModel?: GuestPricingModel;

  @ApiPropertyOptional({ description: 'Minimum number of guests', example: 1 })
  @ValidateIf((o) => o.enableGuestPricing)
  @IsNumber()
  @Min(1)
  minGuests?: number;

  @ApiPropertyOptional({ description: 'Maximum number of guests', example: 10 })
  @ValidateIf((o) => o.enableGuestPricing)
  @IsNumber()
  @Min(1)
  maxGuests?: number;

  @ApiPropertyOptional({ description: 'Price per guest', example: 15.0 })
  @ValidateIf(
    (o) =>
      o.enableGuestPricing &&
      o.guestPricingModel === GuestPricingModel.PER_GUEST,
  )
  @IsNumber()
  @Min(0)
  pricePerGuest?: number;

  @ApiPropertyOptional({
    description: 'Fixed price for the entire group',
    example: 120.0,
  })
  @ValidateIf(
    (o) =>
      o.enableGuestPricing &&
      o.guestPricingModel === GuestPricingModel.FIXED_GROUP,
  )
  @IsNumber()
  @Min(0)
  fixedGroupPrice?: number;

  @ApiPropertyOptional({
    description: 'Base price for a set number of guests',
    example: 50.0,
  })
  @ValidateIf(
    (o) =>
      o.enableGuestPricing &&
      o.guestPricingModel === GuestPricingModel.BASE_WITH_ADDITIONAL,
  )
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'Number of guests included in the base price',
    example: 2,
  })
  @ValidateIf(
    (o) =>
      o.enableGuestPricing &&
      o.guestPricingModel === GuestPricingModel.BASE_WITH_ADDITIONAL,
  )
  @IsNumber()
  @Min(1)
  baseGuests?: number;

  @ApiPropertyOptional({
    description: 'Price for each additional guest',
    example: 10.0,
  })
  @ValidateIf(
    (o) =>
      o.enableGuestPricing &&
      o.guestPricingModel === GuestPricingModel.BASE_WITH_ADDITIONAL,
  )
  @IsNumber()
  @Min(0)
  additionalGuestPrice?: number;

  @ApiProperty({
    description: 'Whether the service is a quote-based model',
    example: false,
  })
  @IsBoolean()
  isQuoteModel: boolean;

  @ApiPropertyOptional({
    description: 'Initial booking fee for quote requests',
    example: 5.0,
  })
  @ValidateIf((o) => o.isQuoteModel)
  @IsNumber()
  @Min(0)
  bookingFee?: number;

  @ApiPropertyOptional({
    type: DeliveryConfigDto,
    description: 'Delivery configuration',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryConfigDto)
  deliveryConfig?: DeliveryConfigDto;

  @ApiPropertyOptional({
    type: PricingRulesDto,
    description: 'Surcharge and pricing rules',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingRulesDto)
  pricingRules?: PricingRulesDto;

  @ApiPropertyOptional({
    type: AvailabilityDto,
    description: 'Availability configuration',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AvailabilityDto)
  availability?: AvailabilityDto;

  @ApiPropertyOptional({
    type: [ServiceVariantDto],
    description: 'List of service variants',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceVariantDto)
  @IsOptional()
  variants?: ServiceVariantDto[];

  @ApiPropertyOptional({
    description: 'Enable tiered pricing packages',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  enableTieredPackages?: boolean;

  @ApiPropertyOptional({
    type: [ServiceTierDto],
    description: 'List of service tiers',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTierDto)
  @IsOptional()
  tiers?: ServiceTierDto[];

  @ApiPropertyOptional({
    description: 'Whether booking requests require provider approval',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  requireApproval?: boolean;

  @ApiPropertyOptional({
    type: BookingRequirementsDto,
    description: 'Specific booking requirements',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingRequirementsDto)
  bookingRequirements?: BookingRequirementsDto;

  @ApiPropertyOptional({
    type: [BundledServiceDto],
    description: 'List of bundled services',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundledServiceDto)
  @IsOptional()
  bundledServices?: BundledServiceDto[];

  @ApiPropertyOptional({
    type: [ConfigurableAddonDto],
    description: 'List of configurable addons',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigurableAddonDto)
  @IsOptional()
  configurableAddons?: ConfigurableAddonDto[];

  @ApiPropertyOptional({
    description: 'Whether the service is featured',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the service is eligible for rotator carousel',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRotatorEligible?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the service is eligible for promotion campaign',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPromotionEligible?: boolean;

  @ApiProperty({
    description: 'ID of the business providing the service',
    example: 'biz-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  businessId: string;
}
