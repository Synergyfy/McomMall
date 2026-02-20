import { IsEnum, IsNumber, IsOptional, IsUUID, Min, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DigitalValueType } from '../digital-value.enums';

export class CreateDigitalValueDto {
  @ApiProperty({
    enum: DigitalValueType,
    example: DigitalValueType.GIFT_CARD,
    description: 'The type of digital value instrument to create (gift_card or voucher).'
  })
  @IsEnum(DigitalValueType)
  type: DigitalValueType;

  @ApiProperty({
    example: 100.00,
    description: 'The initial monetary value assigned to the instrument.',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  initialValue: number;

  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The UUID of the merchant if this instrument is restricted to a specific business.'
  })
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiProperty({
    required: false,
    example: '987fcdeb-51a2-43d7-9876-543210987654',
    description: 'The UUID of the user who owns this instrument. If not provided, it may default to the requester.'
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiProperty({
    required: false,
    example: '2025-12-31T23:59:59Z',
    description: 'ISO 8601 date string indicating when this instrument expires.'
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({
    required: false,
    example: 'reward-uuid',
    description: 'UUID of a reward definition if this instrument was generated via a reward trigger.'
  })
  @IsOptional()
  @IsUUID()
  rewardId?: string;

  @ApiProperty({
    required: false,
    example: { recipientEmail: 'user@example.com', message: 'Happy Birthday!' },
    description: 'Arbitrary JSON metadata for storing recipient details, messages, or campaign info.'
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
