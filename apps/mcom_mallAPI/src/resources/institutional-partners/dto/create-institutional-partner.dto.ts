import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '../entities/institutional-partner.entity';

export class CreateInstitutionalPartnerDto {
  @ApiProperty({ example: 'City Commerce Association' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: PartnerStatus })
  @IsEnum(PartnerStatus)
  @IsOptional()
  status?: PartnerStatus;

  @ApiPropertyOptional({ example: 'Regional Partner' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'David Chen' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'david@citycomm.org' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+44 20 7123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @Min(0)
  @IsOptional()
  plaqueCount?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsInt()
  @Min(0)
  @IsOptional()
  businessCount?: number;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsDateString()
  @IsOptional()
  startDate?: string;
}
