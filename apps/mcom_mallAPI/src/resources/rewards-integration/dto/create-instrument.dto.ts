import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { InstrumentScopeDto } from '../../partner-instruments/dto/instrument-scope.dto';

/**
 * Create a spend-like instrument (voucher / gift card) on behalf of an
 * ecosystem partner such as MCOM Rewards. Authenticated over the zero-hop
 * service mesh (`mall:write` scope), never a shared secret.
 *
 * All new fields are optional so existing callers keep working unchanged.
 */
export class CreateInstrumentDto {
  @ApiProperty({ description: 'Face value of the instrument in GBP.' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Recipient email address.' })
  @IsEmail()
  recipientEmail: string;

  @ApiPropertyOptional({ description: 'Recipient display name.' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Personal message shown on the instrument.',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Issuing business display name.' })
  @IsString()
  @MinLength(1)
  businessName: string;

  @ApiPropertyOptional({
    description:
      'Shared code supplied by the issuer so both apps show one code.',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description:
      'MCOM Rewards issuance id. Used for idempotency and consumption callbacks.',
  })
  @IsOptional()
  @IsString()
  issuanceId?: string;

  @ApiPropertyOptional({ description: 'Mall gift-card template or voucher product id.' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Mall business the instrument is bound to.',
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ type: InstrumentScopeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InstrumentScopeDto)
  scope?: InstrumentScopeDto;

  @ApiPropertyOptional({ description: 'Free-form partner metadata, echoed back.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Create a single-use coupon on behalf of an ecosystem partner.
 * Recipient fields are optional (coupons may be business-level).
 */
export class CreateCouponInstrumentDto {
  @ApiProperty({ description: 'Discount value of the coupon in GBP.' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Recipient email address.' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Recipient display name.' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ description: 'Coupon title / message.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Issuing business display name.' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({
    description:
      'Shared code supplied by the issuer so both apps show one code.',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'ISO-8601 expiry. Defaults to +1 year when omitted.',
  })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @ApiPropertyOptional({
    description:
      'MCOM Rewards issuance id. Used for idempotency and consumption callbacks.',
  })
  @IsOptional()
  @IsString()
  issuanceId?: string;

  @ApiPropertyOptional({ description: 'Mall coupon template id.' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Mall business the coupon is bound to.',
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ type: InstrumentScopeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InstrumentScopeDto)
  scope?: InstrumentScopeDto;

  @ApiPropertyOptional({ description: 'Free-form partner metadata, echoed back.' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
