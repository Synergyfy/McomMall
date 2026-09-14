import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublishCapacitySlotDto {
  @ApiProperty({ description: 'Business UUID' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: 'Service UUID to discount' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'Off-peak time slot descriptor',
    example: 'Tue 14:00 - 16:00',
  })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiProperty({
    description: 'Discount percentage for this slot',
    example: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(90)
  discountRate: number;

  @ApiPropertyOptional({
    description: 'Number of available discounted seats/slots',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  availableSlots?: number = 5;
}
