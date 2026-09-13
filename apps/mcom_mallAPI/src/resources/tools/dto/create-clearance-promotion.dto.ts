import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClearancePromotionDto {
  @ApiProperty({ description: 'Business UUID' })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({
    description: 'Array of low-stock product IDs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ description: 'Discount percentage (1-99)', example: 30 })
  @IsNumber()
  @Min(1)
  @Max(99)
  discountPercentage: number;

  @ApiPropertyOptional({
    description: 'Clearance campaign duration in days',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number = 7;
}
