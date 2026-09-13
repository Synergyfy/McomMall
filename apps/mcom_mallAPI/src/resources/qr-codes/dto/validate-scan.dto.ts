import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScanTargetType {
  BOOKING = 'booking',
  VOUCHER = 'voucher',
  COUPON = 'coupon',
  GIFT_CARD = 'gift_card',
  GENERIC = 'generic',
}

export class ValidateScanDto {
  @ApiProperty({ description: 'Scanned QR code content / string payload' })
  @IsString()
  @IsNotEmpty()
  scannedPayload: string;

  @ApiPropertyOptional({
    description: 'Target type hint',
    enum: ScanTargetType,
  })
  @IsOptional()
  @IsEnum(ScanTargetType)
  targetType?: ScanTargetType = ScanTargetType.GENERIC;
}
