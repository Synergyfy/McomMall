import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdminServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateAdminServiceDto {
  @ApiProperty({ example: 'Full Body Massage', description: 'Service name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Owning business UUID' })
  @IsUUID()
  @IsNotEmpty()
  businessId: string;

  @ApiPropertyOptional({ example: '60-minute deep tissue massage' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Spa', description: 'Service category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 49.99, description: 'Fixed price in GBP' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fixedPrice?: number;

  @ApiPropertyOptional({ example: 60, description: 'Duration in minutes' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ enum: AdminServiceStatus, example: AdminServiceStatus.ACTIVE })
  @IsEnum(AdminServiceStatus)
  @IsOptional()
  status?: AdminServiceStatus;
}
