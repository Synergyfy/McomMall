import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsInt()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  venueType: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  borough?: string;

  @IsString()
  @IsOptional()
  highStreet?: string;

  @IsString()
  @IsNotEmpty()
  entryType: string;

  @IsNumber()
  @IsOptional()
  entryPrice?: number;

  @IsInt()
  @IsOptional()
  entryPoints?: number;

  @IsString()
  @IsOptional()
  selectedTemplate?: string;

  @IsBoolean()
  @IsOptional()
  promoteRotator?: boolean;

  @IsBoolean()
  @IsOptional()
  promoteQR?: boolean;

  @IsBoolean()
  @IsOptional()
  promoteAlert?: boolean;

  @IsBoolean()
  @IsOptional()
  associateVoucher?: boolean;

  @IsString()
  @IsOptional()
  voucherProductId?: string;

  @IsBoolean()
  @IsOptional()
  createCountdown?: boolean;

  @IsString()
  @IsOptional()
  countdownTime?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
