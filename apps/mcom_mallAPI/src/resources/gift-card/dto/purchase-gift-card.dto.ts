import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEmail,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class PurchaseGiftCardDto {
  @ApiProperty({
    description: 'The ID of the business storefront selling this card.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  businessId: string;

  @ApiProperty({
    description: 'The ID of the GiftCardTemplate being purchased.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  templateId: string;

  @ApiProperty({
    description: 'The amount of the gift card.',
    example: 50.0,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: "The recipient's email address." })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({
    description: "The recipient's name (optional).",
    required: false,
  })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiProperty({ description: "The sender's name (optional)." })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiProperty({ description: "The sender's email (optional)." })
  @IsEmail()
  @IsOptional()
  senderEmail?: string;

  @ApiProperty({ description: 'A personal message (optional).' })
  @IsString()
  @IsOptional()
  personalMessage?: string;

  @ApiProperty({
    description: 'The scheduled delivery date (optional, defaults to now).',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  deliveryDate?: Date;

  @ApiProperty({
    description: 'The ID of the GiftCardAsset to attach (optional).',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  assetId?: string;
}
