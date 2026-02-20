import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  IsBoolean,
  IsEnum,
  IsInt,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { VoucherUsage } from '../entities/voucher-product.entity';

export class CreateVoucherProductDto {
  @ApiProperty({ description: 'The name of the voucher product.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A description of the voucher product.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'An array of fixed amounts for the voucher.',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @IsOptional()
  fixedAmounts?: number[];

  @ApiProperty({
    description: 'Whether to allow custom amounts for the voucher.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowCustomAmount?: boolean;

  @ApiProperty({
    description: 'The minimum custom amount allowed.',
    required: false,
    type: Number,
  })
  @ValidateIf((o) => o.allowCustomAmount)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  minCustomAmount?: number;

  @ApiProperty({
    description: 'The maximum custom amount allowed.',
    required: false,
    type: Number,
  })
  @ValidateIf((o) => o.allowCustomAmount)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxCustomAmount?: number;

  @ApiProperty({
    description: 'The usage scope of the voucher.',
    enum: VoucherUsage,
    default: VoucherUsage.BOTH,
    required: false,
  })
  @IsEnum(VoucherUsage)
  @IsOptional()
  usage?: VoucherUsage;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  expiryDays?: number;

  @IsBoolean()
  @IsOptional()
  allowPartialRedemption?: boolean;

  @ApiProperty({
    description: 'The background image URL for the voucher.',
    required: false,
  })
  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @ApiProperty({
    description: 'The text color for the voucher (e.g., #FFFFFF).',
    required: false,
  })
  @IsString()
  @IsOptional()
  textColor?: string;

  @ApiProperty({
    description: 'The threshold to trigger the bonus.',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  bonusThreshold?: number;

  @ApiProperty({
    description: 'The amount of the bonus to add.',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  bonusAmount?: number;
}
