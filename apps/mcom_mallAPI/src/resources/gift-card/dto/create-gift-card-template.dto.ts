import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateGiftCardTemplateDto {
  @ApiProperty({ description: 'The name of the gift card product.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  backgroundImageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  textColor?: string;

  @ApiProperty({
    type: [Number],
    required: false,
    description: 'Array of fixed amounts allowed for this card.',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  fixedAmounts?: number[];

  @ApiProperty()
  @IsBoolean()
  allowCustomAmount: boolean;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.allowCustomAmount)
  @IsNumber()
  @Min(0.01)
  minCustomAmount?: number;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.allowCustomAmount)
  @IsNumber()
  @Min(0.01)
  maxCustomAmount?: number;

  @ApiProperty({
    description: 'Expiry period in days from purchase. Null for no expiry.',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  expiryPeriodDays?: number;

  @ApiProperty({
    description: 'Whether this template is active and can be purchased.',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether this gift card can be reloaded with more funds.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowReloading?: boolean;

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
