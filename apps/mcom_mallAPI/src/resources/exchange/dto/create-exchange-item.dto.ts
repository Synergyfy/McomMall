import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { ExchangeItemType } from '../entities/exchange-item-type.enum';

export class CreateExchangeItemDto {
  @IsEnum(ExchangeItemType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the exchange item.',
    enum: ExchangeItemType,
    example: ExchangeItemType.GENERIC,
  })
  itemType: ExchangeItemType;

  @ValidateIf((o) => o.itemType === ExchangeItemType.PRODUCT)
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the product, required if itemType is "product".',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: false,
  })
  productId?: string;

  @ValidateIf((o) => o.itemType === ExchangeItemType.SERVICE)
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the service, required if itemType is "service".',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: false,
  })
  serviceId?: string;

  @ValidateIf((o) => o.itemType === ExchangeItemType.GENERIC)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description:
      'The title of the exchange item. Required if itemType is "generic".',
    example: 'Handmade Wooden Chair',
    maxLength: 100,
    required: false,
  })
  title?: string;

  @ValidateIf((o) => o.itemType === ExchangeItemType.GENERIC)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'A detailed description of the item. Required if itemType is "generic".',
    example: 'A beautifully crafted chair made from solid oak.',
    required: false,
  })
  description?: string;
}