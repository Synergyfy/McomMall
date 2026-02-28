import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsAddressRequired } from '../validators/is-address-required-for-product.validator';
import {
  DayOfWeek,
  ListingType,
  SellingMode,
  ServiceModel,
} from '../listing.enum';
import { PartialType } from '@nestjs/swagger';

class CreateLocationDto {
  @IsOptional() @IsString() postcode: string;
  @IsOptional() @IsString() addressLine1: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city: string;
  @IsBoolean() showPublicly: boolean;
  @IsOptional() @IsNumber() deliveryRadiusKm?: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicePostcodes?: string[];
  @IsOptional() @IsEnum(ServiceModel) serviceModel?: ServiceModel;
}

class CreateSocialLinkDto {
  @IsNotEmpty() @IsString() platform: string;
  @IsNotEmpty() @IsUrl() url: string;
}

class CreateBusinessHourDto {
  @IsEnum(DayOfWeek) dayOfWeek: DayOfWeek;
  @IsString() openTime: string;
  @IsString() closeTime: string;
  @IsOptional() @IsBoolean() is24h?: boolean;
}

class CreateSpecialDayDto {
  @IsDateString() date: Date;
  @IsString() description: string;
  @IsBoolean() isOpen: boolean;
  @IsOptional() @IsString() openTime?: string;
  @IsOptional() @IsString() closeTime?: string;
}

class CreateStorefrontLinkDto {
  @IsNotEmpty() @IsString() platform: string;
  @IsNotEmpty() @IsUrl() url: string;
}

class CreateProductSellerProfileDto {
  @IsEnum(SellingMode, { each: true }) sellingModes: SellingMode[];
  @IsOptional() @IsString() fulfilmentNotes?: string;
  @IsOptional() @IsString() returnsPolicy?: string;
  @IsBoolean() hasAgeRestrictedItems: boolean;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStorefrontLinkDto)
  storefrontLinks?: CreateStorefrontLinkDto[];
}

class CreateCertificationDto {
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsUrl() fileUrl: string;
}

class CreateServiceProviderProfileDto {
  @IsOptional() @IsUrl() bookingUrl?: string;
  @IsOptional() @IsNumber() @Min(0) fixedPriceFrom?: number;
  @IsOptional() @IsNumber() @Min(0) hourlyRateFrom?: number;
  @IsBoolean() quoteOnly: boolean;
  @IsBoolean() hasPublicLiabilityInsurance: boolean;
  @IsOptional() @IsString() insuranceProvider?: string;
  @IsOptional() @IsDateString() insuranceExpiryDate?: Date;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCertificationDto)
  certifications?: CreateCertificationDto[];
}

export class CreateBusinessDto {
  @IsEnum(ListingType, { each: true }) @IsArray() listingType: ListingType[];
  @IsNotEmpty() @Length(2, 100) businessName: string;
  @IsOptional() @Length(2, 100) legalName?: string;
  @IsOptional() companyRegistrationNumber?: string;
  @IsOptional() vatNumber?: string;
  @IsNotEmpty() @Length(20, 180) shortDescription: string;
  @IsOptional() @Length(0, 2000) about?: string;
  @IsUrl()
  @ValidateIf((object, value) => value !== null && value !== '')
  @IsOptional()
  website?: string;
  @IsNotEmpty() businessPhone: string;
  @IsOptional() @IsEmail() businessEmail?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsUrl() bannerUrl?: string;
  @IsOptional() logoAltText?: string;
  @IsOptional() bannerAltText?: string;
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  media?: string[];
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  @IsAddressRequired()
  location: CreateLocationDto;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSocialLinkDto)
  socialLinks?: CreateSocialLinkDto[];
  @IsNotEmpty() @IsString() sectorId: string;
  @IsNotEmpty() @IsString() categoryId: string;
  @IsNotEmpty() @IsString() subCategoryId: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessHourDto)
  businessHours?: CreateBusinessHourDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpecialDayDto)
  specialDays?: CreateSpecialDayDto[];
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductSellerProfileDto)
  productSellerProfile?: CreateProductSellerProfileDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateServiceProviderProfileDto)
  serviceProviderProfile?: CreateServiceProviderProfileDto;
}

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}

export class SearchBusinessDto {
  @IsString()
  @IsOptional()
  queryText?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'oldest' | 'name';
}
