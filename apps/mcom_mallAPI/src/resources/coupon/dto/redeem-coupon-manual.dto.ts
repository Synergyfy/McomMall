import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RedeemCouponManualDto {
  @ApiProperty({
    description: 'Coupon code or barcode string',
    example: 'CPN-SUMMER-2026',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Merchant branch or location ID' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Optional redemption note' })
  @IsOptional()
  @IsString()
  notes?: string;
}
