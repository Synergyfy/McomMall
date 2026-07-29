import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
