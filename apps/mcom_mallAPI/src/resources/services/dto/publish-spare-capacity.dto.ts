import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SpareCapacitySlotDto {
  @ApiProperty({ description: 'ISO date e.g. "2024-06-10"', example: '2024-06-10' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Start time HH:mm', example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time HH:mm', example: '11:00' })
  @IsString()
  endTime: string;
}

export class PublishSpareCapacityDto {
  @ApiProperty({ description: 'The service to publish spare capacity for' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Eye-catching headline shown in the Local Mall feed', maxLength: 160 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  headline: string;

  @ApiProperty({ description: 'Optional extra detail shown under the headline', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Discount % to apply to the service price (0–100)', example: 20 })
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiProperty({
    description: 'Available time slots for this spare capacity offer',
    type: [SpareCapacitySlotDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpareCapacitySlotDto)
  slots: SpareCapacitySlotDto[];

  @ApiProperty({
    description: 'When this offer expires (ISO datetime). Defaults to end of today if omitted.',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Push to Live Local Mall feed?', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isLiveFeed?: boolean;
}
