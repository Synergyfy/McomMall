import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { BusinessStatus, ListingType } from '../../listings/listing.enum';

export class UpdateBusinessAdminDto {
  @ApiPropertyOptional({ example: 'Urban Eats Restaurant' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Urban Eats LTD' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  legalName?: string;

  @ApiPropertyOptional({ example: 'Authentic Italian pizzas and pasta' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'We have been serving the community for over 10 years...' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: '+15551001' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'contact@urbaneats.com' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional({ example: 'https://urbaneats.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiPropertyOptional({ enum: BusinessStatus, example: BusinessStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({ enum: ListingType, isArray: true, example: [ListingType.PRODUCT] })
  @IsOptional()
  @IsEnum(ListingType, { each: true })
  listingType?: ListingType[];
}
