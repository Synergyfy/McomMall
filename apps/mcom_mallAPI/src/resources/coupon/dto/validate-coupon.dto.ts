import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({
    description: 'The coupon code presented at checkout',
    example: 'WINTERBLAST20',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description:
      'An existing coupon code already applied to the order (for anti-stacking checks)',
    example: 'SUMMER10',
  })
  @IsOptional()
  @IsString()
  existingCouponCode?: string;

  @ApiPropertyOptional({
    description:
      'Current cart subtotal in GBP. When supplied, the response includes the server-computed `discountAmount` for the summary line.',
    example: 49.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
}
